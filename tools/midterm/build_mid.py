import json, re, sys
D = sys.argv[1]; OUT = sys.argv[2]
CJK = re.compile(r'[一-鿿]')
isbopo = lambda s: bool(re.search(r'[ㄅ-ㄩ]', s))
def toks(s):
    out = []; i = 0
    while i < len(s):
        c = s[i]
        if c in '【〔':
            j = s.index('】' if c == '【' else '〕', i); out.append(('t' if c == '【' else 'b', s[i+1:j])); i = j + 1
        else: out.append(('c', c)); i += 1
    return out
def segs_from(tokens, bopos=None):
    """tokens: list of (kind, str); bopos: per-CJK-char readings for the full sentence (optional)"""
    segs = []; bi = 0
    def push_c(ch, b):
        if segs and segs[-1][0] == 'c': segs[-1][1] += ch; segs[-1][2].append(b) if b is not None else None
        else: segs.append(['c', ch, [b] if b is not None else []])
    for k, s in tokens:
        if k == 'c':
            if CJK.match(s):
                b = bopos[bi] if bopos else None; bi += 1; push_c(s, b)
            else: push_c(s, None)
        else:
            n = len(s.split()) if isbopo(s) else len(s)
            bi += n; segs.append([k, s])
    res = []
    for sg in segs:
        if sg[0] == 'c':
            cj = [c for c in sg[1] if CJK.match(c)]
            res.append(['c', sg[1], ' '.join(sg[2]) if bopos and len(sg[2]) == len(cj) else ''])
        else: res.append(sg)
    return res
papers = {}
# 國卷(一)：text 有【目標】〔其他空格〕，bopo 是整句每個字的注音
z1 = json.load(open(f'{D}/zh1.json'))
qs = []
for q in z1['sections'][0]['qs']:
    bop = q['bopo'].split()
    qs.append({'k': 'zhw' if q['type'] == 'write_zh' else 'bopow', 'segs': segs_from(toks(q['text']), bop), 'ans': q['answer'], 'full': q['full']})
papers['g2zh1'] = {'title': '國語期中複習卷(一)', 'sections': [{'no': '一', 'name': '寫國字或注音', 'qs': qs}]}
# 國卷(二)：printed 有全部空格，用 text 找目標在第幾個字
z2 = json.load(open(f'{D}/zh2.json'))
qs = []
for q in z2['sections'][0]['qs']:
    full = q['sentence']; ti = q['text'].index('【')
    tl = len(q['answer']) if q['type'] == 'write_zh' else len(q['shown'])
    # 每個字：('c',ch) 或 ('blank', ch, 顯示)
    chars = []; si = 0
    for k, s in toks(q['printed']):
        if k == 'c':
            chars.append(('c', s)); si += 1 if CJK.match(s) or s == full[si:si+1] else 0
        else:
            if isbopo(s):
                for syl in s.split(): chars.append(('bz', syl))
            else:
                for ch in s: chars.append(('bc', ch))
    # chars 長度要等於 full 長度
    assert len(chars) == len(full), (q['n'], len(chars), len(full), q['printed'], full)
    segs = []
    i = 0
    while i < len(chars):
        if ti <= i < ti + tl:
            show = ' '.join(c[1] for c in chars[ti:ti+tl]); segs.append(['t', show]); i = ti + tl; continue
        k = chars[i][0]
        if k == 'c':
            if segs and segs[-1][0] == 'c': segs[-1][1] += chars[i][1]
            else: segs.append(['c', chars[i][1], ''])
        elif k == 'bz':
            if segs and segs[-1][0] == 'b' and isbopo(segs[-1][1]) and not (i == ti + tl): segs[-1][1] += ' ' + chars[i][1]
            else: segs.append(['b', chars[i][1]])
        else: segs.append(['b', chars[i][1]])
        i += 1
    qs.append({'k': 'zhw' if q['type'] == 'write_zh' else 'bopow', 'segs': segs, 'ans': q['answer'], 'full': full})
papers['g2zh2'] = {'title': '國語期中複習卷(二)', 'sections': [{'no': '一', 'name': '寫國字或注音', 'qs': qs}]}
# 國卷(四)
z4 = json.load(open(f'{D}/zh4.json'))
secs = []
for s in z4['sections']:
    out = []
    for q in s['qs']:
        if q['type'] == 'choice':
            a = q['answer']; idx = q['options'].index(a) if a in q['options'] else int(a) - 1
            out.append({'k': 'choice', 'n': q['n'], 'text': q['text'], 'opts': q['options'], 'ans': idx, 'note': q.get('note', '')})
        elif q['type'] == 'fill':
            out.append({'k': 'punct', 'n': q['n'], 'text': q['text'], 'ans': q['answer']})
        else:
            out.append({'k': 'open', 'n': q['n'], 'text': q['text'], 'ex': q.get('example', ''), 'sample': q.get('answer_full') or (q['answer'] if isinstance(q['answer'], str) else '、'.join(q['answer']))})
    secs.append({'no': s['no'], 'name': s['name'], 'qs': out})
papers['g2zh4'] = {'title': '國語期中複習卷(四)', 'sections': secs}
open(OUT, 'w').write('// 自動產生（python3 tools/midterm/build_mid.py tools/midterm data-midterm.js， 從抄寫的 JSON 轉出來）：二年級 11/1 複習日國語卷（一）（二）（四）\n// 題目、注音照原卷；答案照老師的解答\nconst MID_G2_ZH = ' + json.dumps(papers, ensure_ascii=False, indent=0) + ';\n')
print({k: sum(len(s['qs']) for s in v['sections']) for k, v in papers.items()})
