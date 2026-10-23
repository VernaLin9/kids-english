# 用法：python3 -I tools/heic2jpg.py 照片1.HEIC 照片2.HEIC …（同資料夾輸出 .jpg，最寬 1600px）
# Minimal HEIC -> JPG: parse HEIF boxes, extract grid tiles as Annex-B HEVC, decode+stitch with ffmpeg.
import struct, subprocess, sys, os

def boxes(b, off, end):
    while off + 8 <= end:
        size, typ = struct.unpack('>I4s', b[off:off+8]); hdr = 8
        if size == 1: size = struct.unpack('>Q', b[off+8:off+16])[0]; hdr = 16
        elif size == 0: size = end - off
        yield typ.decode('latin1'), off, off + hdr, off + size
        off += size

def find(b, off, end, typ):
    for t, s, c, e in boxes(b, off, end):
        if t == typ: return s, c, e
    return None

def main(path, out):
    b = open(path, 'rb').read()
    _, mc, me = find(b, 0, len(b), 'meta'); mc += 4  # full box
    # pitm
    _, pc, _ = find(b, mc, me, 'pitm'); primary = struct.unpack('>H', b[pc+4:pc+6])[0]
    # iinf
    _, ic, ie = find(b, mc, me, 'iinf'); ver = b[ic]; p = ic + 4; p += 2 if ver == 0 else 4
    types = {}
    for t, s, c, e in boxes(b, p, ie):
        if t != 'infe': continue
        v = b[c]
        if v >= 2:
            iid = struct.unpack('>H', b[c+4:c+6])[0] if v == 2 else struct.unpack('>I', b[c+4:c+8])[0]
            q = c + (8 if v == 2 else 10)
            types[iid] = b[q:q+4].decode('latin1')
    idb = find(b, mc, me, 'idat'); idat_off = idb[1] if idb else 0
    # iloc
    _, lc, le = find(b, mc, me, 'iloc'); v = b[lc]; p = lc + 4
    os_ls = b[p]; bo_is = b[p+1]; offsz, lensz, basesz = os_ls >> 4, os_ls & 15, bo_is >> 4; idxsz = bo_is & 15 if v in (1, 2) else 0; p += 2
    rd = lambda n, q: (int.from_bytes(b[q:q+n], 'big') if n else 0, q + n)
    cnt, p = (rd(2, p) if v < 2 else rd(4, p))
    locs = {}
    for _ in range(cnt):
        iid, p = (rd(2, p) if v < 2 else rd(4, p))
        method = 0
        if v in (1, 2): method = int.from_bytes(b[p:p+2], 'big') & 15; p += 2
        p += 2  # data ref idx
        base, p = rd(basesz, p); ec, p = rd(2, p); exts = []
        for _ in range(ec):
            if idxsz: _, p = rd(idxsz, p)
            eo, p = rd(offsz, p); el, p = rd(lensz, p); exts.append((base + eo + (idat_off if method == 1 else 0), el))
        locs[iid] = exts
    data = lambda iid: b''.join(b[o:o+l] for o, l in locs[iid])
    # iref dimg
    _, rc, re_ = find(b, mc, me, 'iref'); rv = b[rc]; dimg = {}
    for t, s, c, e in boxes(b, rc + 4, re_):
        if t == 'dimg':
            if rv == 0:
                fr, n = struct.unpack('>HH', b[c:c+4]); dimg[fr] = list(struct.unpack('>' + 'H'*n, b[c+4:c+4+2*n]))
            else:
                fr, n = struct.unpack('>IH', b[c:c+6]); dimg[fr] = list(struct.unpack('>' + 'I'*n, b[c+6:c+6+4*n]))
    # iprp: ipco properties + ipma
    _, prc, pre = find(b, mc, me, 'iprp'); _, coc, coe = find(b, prc, pre, 'ipco')
    props = [(t, c, e) for t, s, c, e in boxes(b, coc, coe)]
    _, mac, mae = find(b, prc, pre, 'ipma'); mv, mflags = b[mac], int.from_bytes(b[mac+1:mac+4], 'big'); p = mac + 4
    n = struct.unpack('>I', b[p:p+4])[0]; p += 4; assoc = {}
    for _ in range(n):
        if mv < 1: iid = struct.unpack('>H', b[p:p+2])[0]; p += 2
        else: iid = struct.unpack('>I', b[p:p+4])[0]; p += 4
        k = b[p]; p += 1; lst = []
        for _ in range(k):
            if mflags & 1: x = struct.unpack('>H', b[p:p+2])[0] & 0x7fff; p += 2
            else: x = b[p] & 0x7f; p += 1
            lst.append(x)
        assoc[iid] = lst
    def prop(iid, typ):
        for x in assoc.get(iid, []):
            if x and props[x-1][0] == typ: return props[x-1]
    # grid
    g = data(primary)
    flags = g[1]; fs = 4 if flags & 1 else 2
    rows, cols = g[2] + 1, g[3] + 1
    W = int.from_bytes(g[4:4+fs], 'big'); H = int.from_bytes(g[4+fs:4+2*fs], 'big')
    tiles = dimg[primary]
    # hvcC of first tile -> parameter sets
    _, hc, he = prop(tiles[0], 'hvcC'); q = hc + 22; narr = b[q]; q += 1; ps = b''
    for _ in range(narr):
        q += 1; nn = struct.unpack('>H', b[q:q+2])[0]; q += 2
        for _ in range(nn):
            L = struct.unpack('>H', b[q:q+2])[0]; q += 2; ps += b'\x00\x00\x00\x01' + b[q:q+L]; q += L
    stream = b''
    for tid in tiles:
        d = data(tid); q = 0; s = ps
        while q + 4 <= len(d):
            L = struct.unpack('>I', d[q:q+4])[0]; s += b'\x00\x00\x00\x01' + d[q+4:q+4+L]; q += 4 + L
        stream += s
    tmp = out + '.hevc'; open(tmp, 'wb').write(stream)
    rot = prop(primary, 'irot'); angle = (b[rot[1]] & 3) * 90 if rot else 0
    vf = f"tile={cols}x{rows},crop={W}:{H}:0:0"
    vf += {90: ",transpose=2", 180: ",transpose=2,transpose=2", 270: ",transpose=1"}.get(angle, "")  # irot is CCW
    vf += ",scale='min(1600,iw)':-1"
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'hevc', '-i', tmp, '-vf', vf, '-frames:v', '1', '-q:v', '3', out], check=True)
    os.remove(tmp)
    print(path, f'{cols}x{rows} tiles', W, H, 'rot', angle)

for a in sys.argv[1:]:
    main(a, a.rsplit('.', 1)[0] + '.jpg')
