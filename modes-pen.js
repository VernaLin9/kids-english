// ✍️ 手寫作答（家長：模擬考要像真的拿筆寫在考卷上，小孩都用平板）
// 模擬考要「寫」的題目改成用手指或觸控筆寫在格子裡，寫完程式判斷對錯：
//  - 注音、數字：平板上直接認（$P 點雲比對；模板 PEN_TPL＝字型骨架＋手寫筆畫，各 32 點），不用網路
//  - 國字：送 Google 手寫辨識（zh_TW）拿候選字，答案在前幾個候選裡就算寫對；連不到網路 → 交卷時請大人對一對（check）
//  - 注音的聲調：ˊˇˋ 寫在右邊細格（twShape 判斷形狀），輕聲 ˙ 寫在上面小格，一聲不用寫（照課本）
// 格子下面顯示「電腦看到」的字：看錯了可以擦掉重寫（只顯示認出來的字，不會說對不對）
// 用 Apple Pencil 寫時，手掌碰到螢幕不算（看到 pen 以後就不收手指）
const PEN_N = 32;
const PEN_A = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
const PEN_SYMS = [..."ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ"];
const PEN_DIGITS = [..."0123456789"];
const PEN_MAX = 4;        // 最接近的模板距離超過這個 → 看不懂（？）
// 答案的距離在最接近的幾倍以內 → 當作寫的是答案（放寬一點，不要寫對被判錯；但亂畫不能常常矇對）
// 測試（模擬手寫抖動 2000 次）：注音 1.1 倍 → 寫對認對 98.9%、亂畫矇對 7%；數字只認最像的 → 99.5%、亂畫 7%
const PEN_LENIENT = { sym: 1.1, digit: 1.0 };
const PEN_ZH_TOP = 6;     // 國字：答案在 Google 前 6 個候選字裡就算寫對
const PEN_TPL = {
  "0": ["b_R0AZrSGul8CEplQ-Ckc1kvAOpII5qch4BeV_X0AUnCEpLygzM2F9CJnqqNrXqh","V0R3N7IAEDBIBNATAYAe9jCnGrLuPyT_Y_cxgukqonqiqcrXrRrMsGnDjAe6a3a3"],
  "1": ["X0A_r_WZBFWvWHL7L_g_WkWQW8T_Z_R4GBWqG_l_WeW4WCWLWUWzP_c_O6J9DDT3","W0W2W4W6W8WAWCWEWGWIWKWMWOWQWSWUWXWZWbWdWfWhWjWlWnWpWrWtWvWxWzW_","PBR9T7V5X4Z2b0c1c4c6c9cCcEcHcKcNcPcScVcXcacdcfciclcocqctcwcyc_c_"],
  "2": ["B_h2q_CEjXSlO1Z_pHN_afKsH6Y0n9h_nQGwfbS_WiOoD9H_T0K3d1oDoMk5lUd_","9ECAG7J3N0T0Y1d1h3j8lDnIkMgQdUZYWcSgOjLnHrEvAzC_H_M_S_X_c_i_n_s_"],
  "3": ["J3izlNBqQUf2pgQ-eXnBU0pqHya-XUlagQk5F8a0nHO1mvDvqlV_M-ezdTUUiYod","C6G5L3Q2U1Z0c3g6k9nClFiIeLbPXSWVaXeaicmfpimlkphtexc_X_TzOyJxFwFw"],
  "4": ["g0g_GWgRSmREsm9mgfgDgqX5MNImBdamg7gKgYlmU9b1gkNmgvOIIR9hDZDmg3gA","d0Z4W8TCQHNLKPHTEXAb7g5jBjGjLjQjWjbjgjljqjwjeGeLeReWebegelerewe_","b0Z4W7UBRFPIMMKPHTFXCaAeEeIeMeReVeaeeejenereeNeSeWeaefejeoesexe_"],
  "5": ["m0KzDKqdO0ZMhzD7kSBropa0OOW_ETH0oXDElvFvfOTNqkP-b-U0g0JSDPK0E3pa","q0k0f0a0V0P0K0G1F7FCEHDMDRIROQTQYPdOhSkWmbpfnkkohsexb_W-RzMyGxBw"],
  "6": ["d0P-BQqalwXPJ6Dlo9qlMUiRb-DGS1EbHuk3RQprGBnUCLBWqfgzV_Y0dPO3CfIX","l0i3e6a9WDSGOJLMJRHVGaEfDjGnJrNuQyU_YzcwhtlroomjkfiafXbZWaRbMcHd"],
  "7": ["P_o0D0YUV0SkgFf0L0UcPscMk8Q0a0k0m4ZQVYTgQoPxH0iBdIJ0O0T0Y0c0h0m0","80C0G0J0N0R0V0Y0c0g0k0n0r0t1r5q8oCnFlJkMiPgTfWdacdagZkXnWrUuTyR_","80C0H0M0R0V0a0f0j0o0t0t3r7pBnGmKkOiTgXebcfakYoWsUxS_JXOXTXXXcXhX"],
  "8": ["Y0O_pfNSoHAjE8jzeSk5DwFKrqN2HaZ_iZVUkOe2oAAqNYDeJzDFrkJ5JPowT1U_","VTQPLLGHGDK8P4U0Y2d6iAmEiIdMYQTUPZKdFhDmIqNuRyW_bxfskookjgebaXaX"],
  "9": ["L-a0qbCRiwUcG6pGX_omfYJaBGP1j5pQEukUdznAphCBFWablsQ_U0BMqVPce2K3","mFjCf9c6Z3W0S3P6M9ICFFIILLPOSRVUYRcOfLiImFmJlNlSkWkajfjjjoisixh_","pBl8h6d4Z1V0R3N6J9FBCEFIIMLPOTRWVTaRePiNmKpKpPpUpZpdpipnpspwp_p_"],
  "ㄅ": ["f_L0tO8NYIpiGCUwkHOKlssYFLrHK7ZzdHTJtTjxnnEHqdJKnHtKBLL4IAhHc_Xx","O0M4K7IBGEEIDLBPCOGOKOOOSOWOaOeOiOmOqOqRqVqZpdphplopotoxn_l_izex"],
  "ㄆ": ["A_T0hdpFGLSsXHTamqoSOBalKxgFQJZehkrLlYS6LGF-dhWoOulFcHUIKJpPWbrI","O0L5I9FECJ9OEJKJQJVJbJgJmJlMiRfWcaZfVjRnNqIuExA_ObSeXibmfpjtoxs-"],
  "ㄇ": ["4u_805vwV75UyXl5F85h4HwjzLt579d6N85O5b4ovq-EyQxdy64Ch6Q738A8p5Z6","80868C8I8O8U8a8g8m8s8y80E0K0Q0W0c0i0o0t1t7tCtItOtUtatgtmtstyr_nx"],
  "ㄈ": ["_x07s2AxR5bz6Wf47J5kE7Nzoz6C6rl3X4K66P5dHyvxUzhz87477F8uo2b4N56S","0060C0I0O0U0Z0f0l0r020262C2I2O2T2Z2f2l2r2x4_A_G_M_S_X_d_j_p_v___"],
  "ㄉ": ["1_zIm-FKNkwfcIO0WWEuyTsqnHRIcvLATeYP8yJptGLJ-NxZpwukgzN6IFhHXIBL","P0M5J9GEDIEJKJPJVJaJgJlJqJqPqUpZpfoknqnvm_j_ezWOUTTZRePjMnIrEvBz"],
  "ㄊ": ["_L0QYsT3UTFvrykNMhFPfhVGlqOubNsLQaIoNP8QerV9VMilTtptJuwKoMfNROSX","X0X6XDXJ3P9PGPMPSPZPfPlPsPyPTUQZNfJkGpCv9-D_J_Q-W-czjzpyjknpqvt-"],
  "ㄋ": ["54i-rNY1RQsibGK3Ywi5gPvXosXMR2D3e0wReAlObQc-qmlwudVQ94ZJi2U2N2f_","80D0I0O0T0Y0e0j0l1h5d9ZCVGRKINONTNYNeNjNoNtNtTsYrdrjqoptpzm_hzcx"],
  "ㄌ": ["5_d0snCQuNPlYPI7dwvacDGvUbjNNPnxGHwTtgLqd6ByaJXVSgoNSPpsizHCdOIQ","AIFILIQIWIcIhInIrJrOqUpZpfokoqnvn_hzcxV0U6UBUHUMTSTXQcNhKlHqEuBz"],
  "ㄍ": ["r-O0GfgPq2P_GKkimEAVMpMBeZpqp8jJDPDaOvhdJkdTO5JFrvmmoBq5PyN8lGII","S0Q4N8KCIHFLDPATCXEcHgJkLoOtQxT_q0o4l8jCgHdLbPYTaXccfghkkomtpxr_"],
  "ㄎ": ["bz07_4YQN6mgg4KSnSPIB7irr3W5TuRRmZgQSBH6NNkmw2m467b4gvS6XyjPVQRF","3090E0K0Q0V0b0h0n0s0y0Q0O6NBMHLMKPQPVPbPhPnPsPuTtYserkqpqvp_l_gy"],
  "ㄏ": ["0-_365DZZ3FJAoL5m3FACgEQ6ut1S4g3C6G5FFEU3xBkq2x2EMCcj3c3V4O58r95","50A0E0I0M0Q0U0Y0c0g0k0o0s0w0-0B0B4B8BCBGBKBOBTBXBbAf9i7m5q4u2x1_"],
  "ㄐ": ["i0i_KWlRL9kkXdlDGhMKgajsPglKl6IbNFLQbckWkejxLhkoSflAlHlOkak3NILT","KAKDKHKKKOKRKVKYKcNcRbUaXah0h4h7hBhEhHhLhOhShVhZhchghjhnhqhuhyh_"],
  "ㄑ": ["k_a0KYYlRGLPgsReW8ITcoTCOKiwObVhY4IWkzPJNNKQPcTgXjameqZ2X6VATEHU","i0h2f4d6b9ZBXDWFUHSJQMOONQLSJUHWJYLaNcPfQhSjUlWnYparctevgxizk_k_"],
  "ㄒ": ["W__105WPc2K4WiWCo1A5T3WsWYu0i2WIY3O3E456V8WUWdWmWwx1l1r1f2WFWL35","004080D0H0L0P0T0Y0c0g0k0o0t0x0_0X0X4X8XDXHXLXPXTXYXcXgXkXoXtXxX_"],
  "ㄓ": ["T0_-0_WdsIBLO-BfpcWJizWqC_rSMefeWTBUW9rzY-WjAFI-6_VvW4rNqXaeHfWE","Z0Z6ZCZIZPZVZbZhHKHRIXJdJjOlUlalglmlslsKsRsXrdrj9_F_L_R_X_d_k_q_"],
  "ㄔ": ["d_k0HOeaFiXEmGRbdneOd7PJYUduLedgiKdTaALLh3THUYdXOddkdrdyIggMddc9","f0d2b4Y6W9UBSDQFOHiLgNePbRZTXVUXSZQbNdLfJhXXXaXdXgXjXmXpXsXvXyX_"],
  "ㄕ": ["5_t0MPV3JkjHwHJ3h1XJEuMaKHt9pHRKn0b2P4dIAyKfHpMVu4sDMKk1S3tHUKp0","L0Q0V0b0g0l0q0v0v5vAvGLLQLVLbLgLlLqLL0L5LAKFKLKQKVKaJfHkFoCs9x6_"],
  "ㄖ": ["p_A2rHCjRNZ0rfUvq1CzCHDVZXN2rTgurqLwi0r9CrC9DcDOWST1G2rNrZrkaulx","B0B8BHBPBXBgBoBwB0J0R0Z0i0q0q8qGqOqXqfqnqwZFVMQTNZVcdfB_J_R_Z_i_"],
  "ㄗ": ["O_p094jYOMV2OhpIK3OWf1OrOCnRr8aXP3k1a1F4OHORObOmOvs4qDoMfaO7lUh1","D0I0M0R0V0a0e0j0n0o4o8nDnHnMnQmUhSF0F5F9FDFIFMFRFVFaFeFjFnFsFwF_"],
  "ㄘ": ["YzU2_D0FcUIVjDHEgkWDSUkbNMsCcs8FPEjUT8cDjfLRXUNVnDawxDDF4FPISCeo","5IAHGHLHQHWGbGgGlFrFwFT0S5RAQGPLOQMVLaLbQbWbbagamaqbognlmqlvk_h_"],
  "ㄙ": ["U0y_3wKUWvllCjQGHxhvstGbT87pNNOwAymvbvppwxSCU4Dfij9m4s6zOJLQIXLx","Z0X4V9TDRHPMNQLUJYHdFhClAq8u7yCxGxLwQwVwZvevjuoustgcigklnpptsxu_"],
  "ㄧ": ["_X0UWVmVFWOWdVtV8WhWKW4WyWRVZVpVBWTVbVfVkVrVvV6WDWIWMW1VQWzWXVnV","0W2W4W6W8WBWDWFWHWJWLWNWPWRWTWVWYWaWcWeWgWiWkWmWoWqWtWvWxWzW_W_W","W0W2W4W6W8WBWDWFWHWJWLWNWPWRWTWWWYWaWcWeWgWiWkWmWoWqWtWvWxWzW_W_"],
  "ㄨ": ["2_w0zwB9cVNppIoiPJXhDwkQt9ibIEupVPSlcc7yIshVv5rEnMYSrlECLGSMeYle","42A2F3L4P6SBVGXKaPdUgZjdlionrsuwx_u0q4n9jDgHcLZQVUSYOcLhHlEpAt7y"],
  "ㄩ": ["y40szx3AVq_V4XlpGs-j_H6M3iuoeqNr8s_O-c_A7Gzr6S3c1nqpZqzmhpJrSr4s","444A4G4M4R4X4d4i4o4u5zBzHzNzSzYzezkzpzvzx0x6xBxHxNxTxYxexkxqxvx_"],
  "ㄚ": ["X_s092XSNDiEYjH7cLo8XsYbSJfIq4ZOYXYfXoXwD4KAlBQGF6r2YQXyXOYUYZYd","B2D4F7H9KCMEOHQKSMVPq0o3m5k8iBgDeGbIZLXOWQWTWWWaWdWhWkWnWrWuWyW_"],
  "ㄛ": ["_5Aq06utWNWyBTg4L67eLwixXBLPr3A6S5Y5ow7Y7kFtXHQycyRPGQm4w356F6c5","0161C1I1O1U1a1f1l1r1x1pLjLdLXLSLMLGLFRDXCcBiBnHoNqTrYteukvqxvy_-"],
  "ㄜ": ["-HBtsxNIW_1JEaU0gHXWLzh-YACI9jYMqHNXTHnzaHR-Y57Jc_GxBeApuGIXlHHI","W0W5WBWG7LCLHLNLSLXLdLiLnLtLlXfXaXVXPXKXIcHhGnFsKtPuUvZxfykzp-u_"],
  "ㄝ": ["yxF2Ik_LaQi20UayHLdgoNPvIXmyiEQRHCYpfX9UuMhPKqIeKSUxj8gziJsyFTI7","0O8OFONOVOcOkOsOzOI0I8IGINIVIcIkIsIzP_W_e_m_t___k0k8kGkNkVkcghZh"],
  "ㄞ": ["1_-024ooXKNl9RuRf1L2UYDDDviysdiPLRY9p0C3U1SQRfBKbP7yJqoOmttXqiFR","0070E0L0S0Z0g0n0u0_0Q4PBOHOONVKbGhCn9t5zMQTQaQhQoQuRtYsfrmqtp-l_"],
  "ㄟ": ["__03SaPAfsE1PNpzYkN073RUPHkwv_coVeP5I0B233QRSXPDPKy_WhameqiumyTc","306090D1G1K1N1R2T3S6SASDRHRKQNQRQUQXSaTeVhWkYnaqcsftjumwpxsyv-y_"],
  "ㄠ": ["S0t_8yaY9WWwJHkLlmJpMWShgvP9HxEOfSpuPxGYTWEsWdOlbwMCR4DylvHLCSnp","T0Q5MAJEFJCOFPLPRPcHYMVRSWPbMgIlFqCv9-B_H-N-TzZyfylxrwfgilmqpvsz"],
  "ㄡ": ["6_q0voC2XRRpW1nIkbKIHwZgjRf1M2qARNqhdZVkMsCyH3l0s4lNhWbUpEa1R1ne","40B0H0O0U0b0h0o0q2n8jEgJdPZUWaRfNjIoDs8x4_DHILMQRUWZaefiknostwx_"],
  "ㄢ": ["i_72m2RWuZS1gKGIAXpocUc0I2mUjBIXDPsglvIBXVsUX1C3h0N1hUeOl6iGNWEX","C0I0N0T0Z0e0k0k3i8fDcH8MEMKMPMVMbMgMmMsMtRsWrcqhqnptoym_hzQaUeYh"],
  "ㄣ": ["90o_PYtY9L6beYtnABGZ7TvfsulXWYB59GBaLZqx8P6WqXvbuisqiXaYTYB2A89J","P0N4M7KBJEHIGLEPCSBWEWIWMWQWTWXWbWfWjWnWqWqapepipmoqotnxn_l_hzhz"],
  "ㄤ": ["2_xIlzGLbbS0JnfJaqSQzyUDPcBv6LoIcSewNLbiYJs-V6RWMiFrSK6ytHAMcNjJ","X0X6XD3I9IGIMISIZIfIlIsIyITISORUQbPhLmIrEwA_SXYXeXiZigimisizn-t-"],
  "ㄥ": ["T0_z0_HWV-8lOGlzG_De4tR9KOdztzO-8_ISS5FbBi7q2whzxzC_PCMKYzJ-ozR-","X0V4U7SBREPIOLMPLSJWHZGdEhDkBoAr8v7y6_A_E_I_M_Q_U_X_b_f_j_n_r_v_"],
  "ㄦ": ["0zZ2-vKXbqaLEoMCaanv_kLNI2aB7uIgbiaTtvgu_qL7LHKSb6aGGkBr3xJbaWbm","M0L5LAKGKLJQJVIbGfDkAo7s4x1_d0d5dBdGdLdQdWdbdgdldrewjwowtxyxzs-m"],
};

// === 辨識（$P：Vatavu, Anthony, Wobbrock 2012）===
function penResample(strokes, n = PEN_N) {
  const ss = strokes.filter(s => s.length);
  let L = 0;
  ss.forEach(s => { for (let i = 1; i < s.length; i++) L += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y); });
  if (!ss.length) return [];
  if (L === 0) return Array.from({ length: n }, () => ({ x: ss[0][0].x, y: ss[0][0].y }));
  const I = L / (n - 1), out = [];
  ss.forEach(s => {
    let prev = s[0], D = 0;
    out.push({ x: prev.x, y: prev.y });
    for (let i = 1; i < s.length; i++) {
      const q = s[i];
      let d = Math.hypot(q.x - prev.x, q.y - prev.y);
      while (D + d >= I && d > 0) {
        const k = (I - D) / d, np = { x: prev.x + k * (q.x - prev.x), y: prev.y + k * (q.y - prev.y) };
        out.push(np); prev = np; d = Math.hypot(q.x - prev.x, q.y - prev.y); D = 0;
      }
      D += d; prev = q;
    }
  });
  while (out.length < n) out.push({ ...out[out.length - 1] });
  return out.slice(0, n);
}
function penNormalize(pts) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const mnx = Math.min(...xs), mny = Math.min(...ys);
  const s = Math.max(Math.max(...xs) - mnx, Math.max(...ys) - mny) || 1;
  const q = pts.map(p => ({ x: (p.x - mnx) / s, y: (p.y - mny) / s }));
  const cx = q.reduce((a, p) => a + p.x, 0) / q.length, cy = q.reduce((a, p) => a + p.y, 0) / q.length;
  return q.map(p => ({ x: p.x - cx, y: p.y - cy }));
}
function penCloudDist(a, b, start) {
  const n = a.length, used = new Array(n).fill(false);
  let sum = 0, i = start;
  do {
    let min = Infinity, idx = -1;
    for (let j = 0; j < n; j++) if (!used[j]) { const d = (a[i].x - b[j].x) ** 2 + (a[i].y - b[j].y) ** 2; if (d < min) { min = d; idx = j; } }
    used[idx] = true;
    sum += (1 - ((i - start + n) % n) / n) * Math.sqrt(min);
    i = (i + 1) % n;
  } while (i !== start);
  return sum;
}
function penMatch(a, b) {
  const n = a.length, step = Math.floor(Math.sqrt(n));
  let min = Infinity;
  for (let i = 0; i < n; i += step) min = Math.min(min, penCloudDist(a, b, i), penCloudDist(b, a, i));
  return min;
}
let penTplCache = null;
function penTemplates() {
  if (penTplCache) return penTplCache;
  penTplCache = {};
  Object.entries(PEN_TPL).forEach(([c, list]) => {
    penTplCache[c] = list.map(s => penNormalize(Array.from({ length: s.length / 2 }, (_, k) => ({ x: PEN_A.indexOf(s[2 * k]) / 63, y: PEN_A.indexOf(s[2 * k + 1]) / 63 }))));
  });
  return penTplCache;
}
// 跟 set 裡每個字比，距離由小到大
function penRank(strokes, set) {
  const pts = penResample(strokes);
  if (pts.length < 2) return [];
  const cloud = penNormalize(pts), T = penTemplates();
  return set.filter(c => T[c]).map(c => ({ c, d: Math.min(...T[c].map(tp => penMatch(cloud, tp))) })).sort((x, y) => x.d - y.d);
}
// 認一格：沒寫→""；看不懂→"？"；expect＝這格應該寫的字（差不多像就算寫的是它）
function penRead(strokes, set, expect) {
  if (!strokes.length) return "";
  const r = penRank(strokes, set);
  if (!r.length || r[0].d > PEN_MAX) return "？";
  const e = expect && r.find(x => x.c === expect);
  if (e && e.d <= r[0].d * (set === PEN_DIGITS ? PEN_LENIENT.digit : PEN_LENIENT.sym)) return expect;
  return r[0].c;
}
// 聲調格：ˊˇˋ 看形狀（twShape）；平平的當作一聲（課本一聲不用寫，寫了也算一聲）；很小一點是輕聲（但輕聲要寫在上面）
function penTone(strokes, h) {
  if (!strokes.length) return "";
  const pts = strokes.flat(), xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  if (Math.max(bw, bh) < h * 0.12) return "˙"; // 聲調本來就寫得小，真的很小一點才算點
  if (bh < bw * 0.28) return "ˉ";
  return twShape(strokes, 0);
}

// === 手寫格（canvas）===
let penSawPencil = false;
function penPad(cls = "", onStroke = () => {}) {
  const cv = el("canvas", { class: `pen-pad ${cls}` });
  const strokes = [];
  let cur = null, curId = null, ctx = null, t0 = 0;
  const fit = () => {
    const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = Math.max(3, Math.min(r.width, r.height) / 18); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#1f2a44";
  };
  const drawStroke = s => { ctx.beginPath(); ctx.moveTo(s[0].x, s[0].y); if (s.length === 1) ctx.lineTo(s[0].x + 0.1, s[0].y); s.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke(); };
  const redraw = () => { fit(); ctx.clearRect(0, 0, cv.width, cv.height); strokes.forEach(drawStroke); };
  const pt = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: Date.now() - t0 }; };
  cv.addEventListener("pointerdown", e => {
    if (e.pointerType === "pen") penSawPencil = true;
    else if (penSawPencil && e.pointerType === "touch") return; // 用觸控筆時，手掌不算
    if (cur || cv.closest(".pen-off")) return;
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch {}
    fit();
    if (!strokes.length) t0 = Date.now();
    cur = [pt(e)]; curId = e.pointerId; strokes.push(cur); drawStroke(cur);
  });
  cv.addEventListener("pointermove", e => {
    if (!cur || e.pointerId !== curId) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    (evs.length ? evs : [e]).forEach(ev => { const p = pt(ev), l = cur[cur.length - 1]; if (Math.hypot(p.x - l.x, p.y - l.y) < 1.5) return; ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(p.x, p.y); ctx.stroke(); cur.push(p); });
  });
  const up = e => { if (!cur || e.pointerId !== curId) return; cur = null; curId = null; onStroke(); };
  cv.addEventListener("pointerup", up);
  cv.addEventListener("pointercancel", up);
  cv.addEventListener("touchstart", e => e.preventDefault(), { passive: false }); // iPad：寫字時不要捲動、不要放大
  return {
    el: cv, strokes,
    size: () => { const r = cv.getBoundingClientRect(); return { w: r.width, h: r.height }; },
    clear: () => { strokes.length = 0; if (ctx) redraw(); },
    undo: () => { strokes.pop(); if (ctx) redraw(); },
  };
}
// 一題的所有格子：「↩️ 上一筆」「🧹 全部擦掉」
function penGroup(onChange) {
  const pads = [], hist = [];
  return {
    pad(cls) { const p = penPad(cls, () => { hist.push(p); onChange(); }); pads.push(p); return p; },
    pads,
    tools: () => el("div", { class: "pen-tools" },
      el("button", { class: "btn btn--ghost pen-tool", onclick: () => { const p = hist.pop(); if (p) { p.undo(); onChange(); } } }, t("↩️ 上一筆")),
      el("button", { class: "btn btn--ghost pen-tool", onclick: () => { pads.forEach(p => p.clear()); hist.length = 0; onChange(); } }, t("🧹 全部擦掉"))),
  };
}
const penReadEl = () => el("div", { class: "pen-read", "data-nobopo": "1" });
const penShowRead = (box, text) => box.replaceChildren(el("span", { class: "pen-read__label" }, t("電腦看到：")), el("b", { "data-nobopo": "1" }, text || "　"));
// 寫的字做成小圖（交卷後給大人看）
function penImg(pads) {
  const W = 80, cv = document.createElement("canvas");
  cv.width = W * pads.length; cv.height = W;
  const c = cv.getContext("2d");
  c.fillStyle = "#fff"; c.fillRect(0, 0, cv.width, cv.height);
  c.strokeStyle = "#1f2a44"; c.lineWidth = 4; c.lineCap = c.lineJoin = "round";
  pads.forEach((p, k) => {
    const { w, h } = p.size(), s = W / Math.max(w, h, 1);
    p.strokes.forEach(st => { c.beginPath(); st.forEach((q, i) => (i ? c.lineTo : c.moveTo).call(c, k * W + q.x * s, q.y * s)); c.stroke(); });
  });
  return cv.toDataURL("image/png");
}

// === 注音：一個字＝上面輕聲小格＋三個注音格（直的，由上往下寫）＋右邊聲調細格 ===
function penSyl(g) {
  const dot = g.pad("pen-pad--dot"), syms = [0, 1, 2].map(() => g.pad("pen-pad--sym")), tone = g.pad("pen-pad--tone");
  const node = el("div", { class: "pen-syl" }, el("div", { class: "pen-syl__dot" }, dot.el), el("div", { class: "pen-syl__col" }, syms.map(s => s.el)), el("div", { class: "pen-syl__tone" }, tone.el));
  const read = expect => {
    const e = expect ? splitSyl(expect) : { symbols: [], tone: "" };
    const written = syms.filter(s => s.strokes.length);
    const letters = written.map((s, k) => penRead(s.strokes, PEN_SYMS, e.symbols[k]));
    let tn = penTone(tone.strokes, syms[0].size().h);
    if (tn === "ˉ") tn = "";
    const top = dot.strokes.length ? "˙" : "";
    const bad = (top && tone.strokes.length) || tn === "˙"; // 輕聲寫在右邊、或上面右邊都寫了
    const toneOut = top || tn;
    return { filled: written.length > 0, text: letters.join("") + (tn === "˙" ? "˙(要寫在上面)" : toneOut), ok: !bad && !letters.includes("？") && mpNorm(letters.join("") + toneOut) === mpNorm(expect || "") };
  };
  return { el: node, read };
}
// 寫一個詞的注音（聽寫、看圖寫注音、寫出國字的注音）；全部的字都有寫才算作答
function penBopo(bopo, pick) {
  const exp = bopo.trim().split(/\s+/);
  const readBox = penReadEl();
  const update = () => {
    const rs = syls.map((s, i) => s.read(exp[i]));
    penShowRead(readBox, rs.map(r => r.filled ? r.text : "＿").join(" "));
    pick(rs.every(r => r.filled) ? { text: rs.map(r => r.text).join(" "), ok: rs.every(r => r.ok) } : null);
  };
  const g = penGroup(update);
  const syls = exp.map(() => penSyl(g));
  return el("div", { class: "pen-ans" }, el("div", { class: "m-hint" }, t("一個字寫一行：注音由上往下寫，二三四聲寫在右邊，輕聲寫在上面，一聲不用寫")),
    el("div", { class: "pen-row" }, syls.map(s => s.el)), readBox, g.tools());
}
// 寫一個注音符號（注音大會考：把蓋住的注音寫出來）
function penSymbol(answer, pick, set = PEN_SYMS) {
  const readBox = penReadEl();
  const update = () => {
    const r = penRead(pad.strokes, set, answer);
    penShowRead(readBox, r);
    pick(r ? { text: r, ok: r === answer } : null);
  };
  const g = penGroup(update), pad = g.pad("pen-pad--big");
  return el("div", { class: "pen-ans" }, el("div", { class: "pen-row" }, pad.el), readBox, g.tools());
}
// 寫聲調：一聲不用寫（按「一聲」），其他寫在右邊細格、輕聲寫在上面
function penToneAns(syl, answer, pick) {
  const readBox = penReadEl();
  let first = false;
  const firstBtn = el("button", { class: "btn btn--ghost pen-first", onclick: () => { first = !first; firstBtn.classList.toggle("pen-first--on", first); if (first) g.pads.forEach(p => p.clear()); update(); } }, t("這是一聲（不用寫）"));
  const update = () => {
    if (g.pads.some(p => p.strokes.length)) { first = false; firstBtn.classList.remove("pen-first--on"); }
    let tn = penTone(tone.strokes, symH());
    if (tn === "ˉ") tn = "";
    const top = dot.strokes.length ? "˙" : "";
    const has = first || top || tone.strokes.length;
    const val = first ? "" : tn === "˙" ? "˙?" : top && tone.strokes.length ? "?" : top || tn;
    penShowRead(readBox, !has ? "" : val === "" ? "一聲" : val === "˙?" ? "輕聲要寫在上面" : val === "?" ? "上面和右邊都寫了" : BP_TONE_NAME[val]);
    pick(has ? { text: val === "" ? "一聲" : BP_TONE_NAME[val] || "寫錯位置", ok: val === answer } : null);
  };
  const g = penGroup(update);
  const dot = g.pad("pen-pad--dot"), tone = g.pad("pen-pad--tone pen-pad--tone-tall");
  const symH = () => col.firstChild?.getBoundingClientRect().height || 64;
  const col = el("div", { class: "pen-syl__col pen-syl__col--print" }, [...splitSyl(syl).symbols].map(c => el("span", { class: "pen-print" }, c)));
  const node = el("div", { class: "pen-syl pen-syl--print", style: `--rows: ${Math.max(1, splitSyl(syl).symbols.length)}` }, el("div", { class: "pen-syl__dot" }, dot.el), col, el("div", { class: "pen-syl__tone" }, tone.el));
  return el("div", { class: "pen-ans" }, el("div", { class: "m-hint" }, t("聲調寫在右邊；輕聲寫在上面；一聲按下面的按鈕")), el("div", { class: "pen-row" }, node), firstBtn, readBox, g.tools());
}
// 寫數字：n 格，一格寫一個數字，從左邊開始寫（空的格子不算）
function penDigitsEl(n, answer, onRead) {
  const readBox = penReadEl();
  const update = () => {
    const ds = g.pads.filter(p => p.strokes.length).map((p, k) => penRead(p.strokes, PEN_DIGITS, answer != null ? String(answer)[k] : null));
    const text = ds.join("");
    penShowRead(readBox, text);
    onRead(text);
  };
  const g = penGroup(update);
  for (let k = 0; k < n; k++) g.pad("pen-pad--digit");
  return { el: el("div", { class: "pen-ans" }, el("div", { class: "pen-row pen-row--digits" }, g.pads.map(p => p.el)), readBox, g.tools()), g };
}
function penNum(answer, unit, pick, n = Math.max(2, String(answer).length)) {
  const d = penDigitsEl(n, answer, text => pick(text ? { text: `${text}${unit || ""}`, ok: !text.includes("？") && Number(text) === answer } : null));
  return el("div", { class: "pen-num" }, el("div", { class: "m-hint" }, t(`把答案寫在格子裡，一格寫一個數字${unit ? `（單位：${unit}）` : ""}`)), d.el);
}
// 選擇題照紙本：在 ( ) 裡寫答案的號碼 1～4
function penParenNum(answer, pick) {
  const d = penDigitsEl(1, answer, text => pick(text ? { text: text.includes("？") ? text : "①②③④"[Number(text) - 1] || text, ok: Number(text) === answer } : null));
  const pad = d.el.querySelector(".pen-row");
  pad.prepend(el("span", { class: "pen-paren" }, "("));
  pad.append(el("span", { class: "pen-paren" }, ")"));
  return el("div", { class: "pen-num" }, d.el);
}
// 數字＋「寫好了」（二年級數學一步一步的題目）：onSubmit(數字, reset)
function penNumSubmit(answer, onSubmit) {
  let text = "";
  const d = penDigitsEl(3, answer, x => { text = x; ok.disabled = !x; });
  const ok = el("button", { class: "btn btn--accent btn--full pen-ok", disabled: true, onclick: e => {
    if (text.includes("？")) { e.currentTarget.parentElement.querySelector(".guard-toast")?.remove(); e.currentTarget.before(el("div", { class: "guard-toast" }, t("電腦看不清楚，擦掉再寫一次"))); return; }
    onSubmit(Number(text), () => { d.g.pads.forEach(p => p.clear()); text = ""; ok.disabled = true; });
  } }, t("✓ 寫好了"));
  return el("div", { class: "pen-num" }, d.el, ok);
}

// === 國字：Google 手寫辨識 ===
async function penGoogle(strokes, w, h) {
  const body = JSON.stringify({ options: "enable_pre_space", requests: [{ writing_guide: { writing_area_width: Math.round(w), writing_area_height: Math.round(h) },
    ink: strokes.map(s => [s.map(p => Math.round(p.x)), s.map(p => Math.round(p.y)), s.map(p => p.t || 0)]), language: "zh_TW" }] });
  for (const url of ["https://inputtools.google.com/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8", "https://www.google.com.tw/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8"]) {
    try {
      const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 6000);
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body, signal: ctl.signal });
      clearTimeout(tm);
      const j = await r.json();
      if (j?.[0] === "SUCCESS" && Array.isArray(j[1]?.[0]?.[1])) return j[1][0][1];
    } catch {}
  }
  return null;
}
// 寫國字：一個字一格（田字格）；check＝連不到 Google，交卷時請大人對
function penHanzi(ans, pick) {
  const chars = [...ans];
  const res = chars.map(() => null), seq = chars.map(() => 0), timers = [];
  const readBox = penReadEl();
  const update = () => {
    const filled = g.pads.every(p => p.strokes.length);
    const shown = chars.map((c, i) => !g.pads[i].strokes.length ? "＿" : res[i] === null ? "…" : res[i] === false ? "？" : res[i].includes(c) ? c : (res[i][0] || "？"));
    if (res.some(r => r === false)) readBox.replaceChildren(el("span", { class: "pen-read__label" }, t("網路連不到，電腦看不到手寫的字；寫好就按下一題，交卷時請大人對一對")));
    else penShowRead(readBox, shown.join(""));
    if (!filled || res.some(r => r === null)) return pick(null);
    if (res.some(r => r === false)) return pick({ text: "（手寫）", check: true, ok: false, img: penImg(g.pads) });
    pick({ text: shown.join(""), ok: shown.join("") === ans, img: penImg(g.pads) });
  };
  const g = penGroup(() => {
    g.pads.forEach((p, i) => {
      const key = p.strokes.length + ":" + (p.strokes.at(-1)?.length || 0);
      if (p.lastKey === key) return;
      p.lastKey = key; res[i] = null; clearTimeout(timers[i]);
      if (!p.strokes.length) return;
      const my = ++seq[i];
      timers[i] = setTimeout(async () => {
        const { w, h } = p.size();
        const c = await penGoogle(p.strokes, w, h);
        if (my !== seq[i]) return;
        res[i] = c ? c.slice(0, PEN_ZH_TOP) : false;
        update();
      }, 700);
    });
    update();
  });
  chars.forEach(() => g.pad("pen-pad--zh"));
  return el("div", { class: "pen-ans" }, el("div", { class: "pen-row" }, g.pads.map(p => p.el)), readBox, g.tools());
}

// 原題卷（一年級數學）的空格：跳出手寫小格，寫好按「好了」
function penPopup(kind, set, onDone, answer) {
  fsPadEl?.remove();
  const close = () => { fsPadEl?.remove(); fsPadEl = null; };
  let text = "";
  const n = kind === "num" ? 2 : Math.min(4, set.length);
  const readBox = penReadEl();
  const update = () => {
    const ws = g.pads.filter(p => p.strokes.length);
    const rs = ws.map((p, k) => penRead(p.strokes, set, kind === "num" && answer != null ? String(answer)[k] : null));
    text = rs.join(""); penShowRead(readBox, text); done.disabled = !text;
  };
  const g = penGroup(update);
  for (let k = 0; k < n; k++) g.pad("pen-pad--digit");
  const done = el("button", { class: "fs-pad__key fs-pad__key--done", disabled: true, onclick: () => {
    if (text.includes("？")) { readBox.replaceChildren(t("電腦看不清楚，擦掉再寫一次")); return; }
    onDone(kind === "num" ? Number(text) : set.filter(c => text.includes(c))); close();
  } }, t("好了"));
  fsPadEl = el("div", { class: "fs-pad pen-popup" },
    el("div", { class: "fs-pad__tip" }, t(kind === "num" ? "把數字寫在格子裡，寫好按「好了」" : "把代號寫在格子裡（一格一個，可以寫好幾個），寫好按「好了」")),
    el("div", { class: "pen-row" }, g.pads.map(p => p.el)), readBox,
    el("div", { class: "pen-popup__btns" }, g.tools(), el("button", { class: "fs-pad__key fs-pad__key--soft", onclick: close }, "✕"), done));
  document.body.appendChild(fsPadEl);
}
