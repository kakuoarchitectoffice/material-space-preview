(() => {
  "use strict";
  const products = {
    travertine: { id: "travertine", type: "tile", title: "Limestone Grey", code: "要確認", image: "assets/tile-travertine.jpg", color: "Warm Grey / デモ情報", size: "要確認", thickness: "要確認", finish: "Matt Stone / デモ情報", use: ["床", "壁", "屋内"], description: "光を静かに受け止め、空間の奥行きをつくる温かみのある石目調タイル。正式商品選定前のコンセプト表示です。", projectId: "quiet-residence", roomId: "arrival" },
    deepstone: { id: "deepstone", type: "tile", title: "Deep Stone", code: "要確認", image: "assets/tile-deep-stone.jpg", color: "Charcoal / デモ情報", size: "要確認", thickness: "要確認", finish: "Rough Matt / デモ情報", use: ["床", "壁", "屋内"], description: "低彩度の濃淡と細かな粒子感が、落ち着いた陰影をつくるチャコールの石目調タイルです。", projectId: "quiet-residence", roomId: "lounge" },
    clay: { id: "clay", type: "tile", title: "Craft Clay", code: "要確認", image: "assets/tile-craft-clay.jpg", color: "Earth Brown / デモ情報", size: "要確認", thickness: "要確認", finish: "Soft Glaze / デモ情報", use: ["壁", "屋内"], description: "手仕事の揺らぎと土の粒子感を残した、穏やかな艶のクラフトタイルです。", projectId: "quiet-residence", roomId: "lounge" },
    limestone: { id: "limestone", type: "tile", title: "Soft Limestone", code: "要確認", image: "assets/tile-soft-limestone.jpg", color: "Pale Greige / デモ情報", size: "要確認", thickness: "要確認", finish: "Fine Matt / デモ情報", use: ["床", "壁", "屋内外"], description: "微細な石灰岩の粒子を静かに表現し、室内から中庭へ素材の連続性を生むタイルです。", projectId: "quiet-residence", roomId: "courtyard" }
  };
  const rooms = [
    { id: "arrival", type: "room", projectId: "quiet-residence", order: 1, title: "ARRIVAL", titleJa: "玄関・アライバル", image: "assets/images/quiet-arrival.png", story: "石の壁と床が、外の気配から内側の静けさへゆっくり切り替える到着空間。素材を主張させず、光の輪郭として感じられるよう構成しています。", productIds: ["travertine", "deepstone"], traces: [{ id: "a-wall", label: "WALL 01", productId: "deepstone", x: 20, y: 30 }, { id: "a-floor", label: "FLOOR 02", productId: "travertine", x: 42, y: 63 }, { id: "a-counter", label: "COUNTER 03", productId: "clay", x: 72, y: 56 }] },
    { id: "lounge", type: "room", projectId: "quiet-residence", order: 2, title: "LOUNGE", titleJa: "ラウンジ", image: "assets/images/quiet-lounge.png", story: "低い家具と間接光が、壁面の凹凸や焼きムラを穏やかに拾うラウンジ。床・壁・カウンターの素材が一つの景色としてつながります。", productIds: ["deepstone", "clay", "travertine"], traces: [{ id: "l-wall", label: "WALL 01", productId: "clay", x: 28, y: 28 }, { id: "l-floor", label: "FLOOR 02", productId: "deepstone", x: 47, y: 65 }, { id: "l-hearth", label: "HEARTH 03", productId: "travertine", x: 72, y: 48 }] },
    { id: "courtyard", type: "room", projectId: "quiet-residence", order: 3, title: "COURTYARD", titleJa: "中庭", image: "assets/images/quiet-courtyard.png", story: "屋内と中庭の床レベルを揃え、タイルの連続性で内外の境界を薄くした場所。水分や夕暮れの光による表情の変化も体験できます。", productIds: ["limestone", "deepstone"], traces: [{ id: "c-floor", label: "PAVING 01", productId: "limestone", x: 42, y: 61 }, { id: "c-wall", label: "WALL 02", productId: "deepstone", x: 69, y: 35 }] }
  ];
  const projects = [
    { id: "quiet-residence", type: "project", status: "published", title: "QUIET RESIDENCE", category: "RESIDENCE", location: "KYOTO / DEMO", description: "光と石の連続性で、到着から中庭までを一つの静かな体験にする住空間。", image: "assets/images/quiet-arrival.png", roomIds: ["arrival", "lounge", "courtyard"] },
    { id: "stillness-hotel", type: "project", status: "published", title: "STILLNESS HOTEL", category: "HOSPITALITY", location: "HAKONE / CONCEPT", description: "深い色の素材と低い光がつくる滞在空間。", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85", roomIds: [] },
    { id: "earthen-gallery", type: "project", status: "published", title: "EARTHEN GALLERY", category: "RETAIL", location: "TOKYO / CONCEPT", description: "土の質感と手仕事の揺らぎを背景にした小さなギャラリー。", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85", roomIds: [] },
    { id: "soft-focus-office", type: "project", status: "published", title: "SOFT FOCUS OFFICE", category: "WORKSPACE", location: "OSAKA / CONCEPT", description: "グレージュの素材が集中と対話の余白をつくるワークスペース。", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=85", roomIds: [] }
  ];
  window.TileSpaceData = { products, rooms, projects };
})();
