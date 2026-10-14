# 『放課後、存在しない七限目』素材クレジット

本作は『偏差値60の教室から✝本質✝が漏れ出している件について』の人物・学校設定を用いた、**ゲーム独自の番外編**です。「帰れない放課後」、七限目の異変、会話、戦闘、結末はゲーム用の創作で、原作の出来事を再現したものではありません。

## 原作・参照立ち絵

- ユーザー提供：原作テキスト、および Google Drive「本質images」。
- 参照・会話ポートレート：`chr_mie_01_reishou.png`、`chr_ryoma_01_tsuujou.png`、`chr_rei_01_suzushii.png`、`chr_terachi_01_nemusou.png`、`chr_satou_01_game_gyoushi.png`。
- 著作者名・公開ライセンスは**不明／未確認**。提供資料はCC0などのフリー素材とは扱っていません。第三者への一般的な再利用許諾を本プロジェクトは与えません。
- 改変：会話用の顔・上半身の切り出し、縮小。フィールド用スプライトは立ち絵の縮小ではなく、下記LPCパーツを組み合わせた別の画像です。キャラクター造形の完全一致を保証するものではありません。
- 原作全文・参照原寸画像は `.gitignore` によりリポジトリへ追加しません。

## 歩行・詠唱・キャラクターパーツ

**Universal LPC Spritesheet Character Generator**

- 取得元：https://github.com/sanderfrenken/Universal-LPC-Spritesheet-Character-Generator
- ライセンス：各パーツで提供される選択肢から **Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0)** を選択。
- ライセンス：https://creativecommons.org/licenses/by-sa/3.0/ ／ https://creativecommons.org/licenses/by-sa/3.0/legalcode
- 原作者・改作者・原典URL・提供ライセンスは `assets/licenses/lpc/` の各JSONと `CREDITS.csv` に保存。下の「使用パーツ別明細」に全寄与者を記載。
- 使用：男性素体、人間の頭・眼、フォーマルパンツ、革靴、白い長袖シャツ、襟付きジャケット、ネクタイ、人物別に組み合わせた髪、眼鏡。
- 改変：パーツ合成、紺制服・髪色の調整、キャラクター別の毛束の合成、LPC髪の陰影を生かした個別輪郭・毛束の再編集、128pxグリッド上での細い眼鏡・目元の描き直し、各コマの頭位置への追従、寺地のヘッドフォン、シートの切り出し。元の歩行・手足のポーズを維持しています。
- `assets/characters/` の派生PNGは **CC BY-SA 3.0** で提供します。原作固有の名称・設定の権利とは別です。
- 元の歩行は64×64px（頭部の細部編集のため128×128pxで書き出し、ワールド内の表示サイズは64pxのまま）、4方向×9コマ（立ち1＋歩行8）。横歩きは原作パーツの独立フレームです。詠唱は4方向×7コマ。足音と歩行速度を連動。

## 学校タイルセット

### Cool School — NettySvit

- 原典：https://opengameart.org/content/cool-school-tileset
- ライセンス：**CC0 1.0 Universal** https://creativecommons.org/publicdomain/zero/1.0/
- 取得ミラー：https://github.com/Davi-info/institute-of-evil---game/tree/main/assets/terrain/coolschool （取得時の実際のブランチ名は取得スクリプトがAPIのデフォルトを使用）
- 原作者のCC0表記を確認して使用。ミラー側ゲームのライセンスをタイルの根拠にはしていません。
- 改変：彩度・明度の調整、切り出し、スケーリング、黒板上の文字と色の合成。
- 用途：机、椅子、本棚、窓、教材、小物、教室設備。

### LPC Revised — Eliza Wyatt / Lanea Zimmerman

- 取得元：https://github.com/ElizaWy/LPC
- ライセンス：素材別クレジットに基づき **OGA-BY 3.0** https://opengameart.org/content/oga-by-30-faq
- 著作者：**Eliza Wyatt (DeathsDarling / ElizaWy)**、**Lanea Zimmerman (Sharm)**。
- 原典・素材別寄与：`assets/licenses/floor-credits.txt`、`wall-credits.txt`、`furniture-credits.txt`。プロジェクトの説明・補足も `eliza-README.md`、`eliza-credits.txt` に保存。
- 使用：Wood Floor A、Tile A、Painted Walls、Planter、Vending Machine、Clock Grandfather、Desk Office、Copy Machine。Herringbone・Shelfは同梱されますがゲーム内配置は未使用です。
- 改変：切り出し、拡大、配置。照明は描画時の合成です。

## 音楽

**cynicmusic / The Cynic Project** — CC0

- Town Theme：https://opengameart.org/content/town-theme-rpg
- Battle Theme A：https://opengameart.org/content/battle-theme-a
- 取得ミラー：https://github.com/llamacademy/music-fader/tree/main/Assets/Vendor/cynicmusic
- ライセンス証跡：`assets/licenses/cynicmusic.txt`。
- 改変なし。探索／対話バトルで切り替え、音量調整とループ再生を実装。

## 効果音・エフェクト用テクスチャ

**Kenney** — CC0

- https://kenney.nl
- RPG Sounds / UI Sounds：足音、紙を開く音、ドア、UIクリック。
- 取得ミラー：https://github.com/iwenzhou/kenney
- ライセンス：`assets/licenses/kenney-CC0.md`。
- Particle Pack：magic_01、magic_03、spark_01、light_01、smoke_03、star_01。
- 取得ミラー：https://github.com/Calinou/kenney-particle-pack
- ライセンス：`assets/effects/LICENSE.txt`。
- エフェクトは外部テクスチャを回転・拡大・加算合成。粒子の挙動、寿命、カメラ、光条などの制御はこのゲームのコードです。既製の専用アニメーションシートを取得した、と偽ってはいません。

## フォント

- **しっぽり明朝 / Shippori Mincho** — Fontdasu。https://github.com/fontdasu/ShipporiMincho
- **ZEN角ゴシックNEW / Zen Kaku Gothic New** — ZEN。https://github.com/googlefonts/zen-kakugothic
- いずれも **SIL Open Font License 1.1**。`@fontsource` のnpm配布をローカル同梱。ライセンス全文：`assets/licenses/fonts/`。

## ランタイム・配布

- 描画：Canvas 2D。UI：HTML/CSS。外部スプライト・タイル・音源を接続する専用ゲームコード。
- 開発・配布ビルド：Vite（MIT）。テスト：Node.js、Playwright（Apache-2.0）。テストブラウザは製品には同梱しません。
- 元リソースのネット接続をプレイ時に必要としないよう、使用アセットを同梱しています。
- コード全体へのライセンス付与は別途指定していません。画像・音源・フォントの第三者ライセンスは、それぞれの対象ファイルに適用されます。
- 新しいテクスチャを生成AIで生成したものはありません。

## 頭部再編集・アクション版（2026-10-14）

- 髪を単に伸ばす方式を廃し、元絵を見て頭部の輪郭・毛束・目元・眼鏡を個別編集。`scripts/pixel_heads.py` と `art/heads/` に編集元を保存。
- 髪の陰影にはLPCのplain / spiked / bangsshort / messy2を使用。上から独自の輪郭と毛束、細い目と眼鏡を合成しています。外部素材だけで元絵の髪型が再現できた、と主張するものではありません。
- 寺地はユーザーの追加指示に基づく**センター分け**。根元を上げた短めの毛束を左右へ流します。前の片側に流す解釈を撤回。
- 身体・制服・歩行のポーズはLPCを保持。肌の色調整、頭部の追従合成以外に足元や当たり判定は変更していません。
- 対話ポートレートとしての提供立ち絵は変更していません。
- 別画面のターン制戦闘を廃止し、校内マップで戦うアクションに変更。8体の巡回敵と4つの物語上の番人。追跡・予告・回避・近接攻撃・光弾・共鳴・回復の制御は独自コード。
- ストーリーガイド、目的地へ歩ける経路の道しるべ、推奨ルートの手帳を追加。

### 現行モンスター：文字からできた「訂正の答案」

- **NettySvit / Cool School（CC0）** の紙束テクスチャを使用。上記の出典・ミラーと同じものです。
- 使用範囲：`CoolSchool_tileset.png` の `(290, 541, 37, 33)`。
- 改変：灰白色への色替え、ページの伸縮・回転・浮遊アニメーション、赤い×、チョーク片の加筆。`scripts/monsters.py` で再現可能。
- `assets/monsters/correction-walk.png` と `correction-cast.png`、およびそこに加えた独自の小さな図案は **CC0 1.0** で提供します。
- 黒板消しの小物は独自のドット加筆。放射・光のテクスチャは従来どおりKenneyです。
- 前版のLPC骸骨画像は撤去しました。由来のない骸骨を物語に付け足すのではなく、黒板の「消去」という文字が答案の形になる場面を設けています。未起動の敵を半透明で表示する処理も廃止。
- 以前の素材の帰属通知は履歴として下に保持しています。現行のゲームには骸骨スプライトを同梱していません。

### 導入・寺地の追加修正

- 寺地は短めで軽いセンター分け。耳側・襟足の量を減らし、根元を持ち上げ、目を覆わない輪郭へ。
- 日常の帰り支度 → 両馬との会話 → 下校口を通ると教室へ戻る体験 → 黒板の文を確認 → 文字が答案になる → 黒板消しで身を守る、という導入に変更。
- 敵の出現は該当の台詞・場面に同期。開始時・合流時・下校口の場面には敵はいません。最初の戦闘後、散った答案が校内を巡回します。

## 使用パーツ別明細（配布元メタデータ）

旧版で使用したパーツの通知も保持しています。

### `body/bodies/male`

- Authors: bluecarrot16, Benjamin K. Smith (BenCreating), Evert, Eliza Wyatt (ElizaWy), TheraHedwig, MuffinElZangano, Durrani, Johannes Sj?lund (wulax), Stephen Challener (Redshrike)
- Upstream notes: see details at https://opengameart.org/content/lpc-character-bases; 'Thick' Male Revised Run/Climb by JaidynReiman (based on ElizaWy's LPC Revised)
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- https://opengameart.org/content/lpc-medieval-fantasy-character-sprites
- https://opengameart.org/content/lpc-male-jumping-animation-by-durrani
- https://opengameart.org/content/lpc-runcycle-and-diagonal-walkcycle
- https://opengameart.org/content/lpc-revised-character-basics
- https://opengameart.org/content/lpc-be-seated
- https://opengameart.org/content/lpc-runcycle-for-male-muscular-and-pregnant-character-bases-with-modular-heads
- https://opengameart.org/content/lpc-jump-expanded
- https://opengameart.org/content/lpc-character-bases

### `eyes/human`

- Authors: JaidynReiman, Matthew Krohn (makrohn), Stephen Challener (Redshrike)
- Upstream notes: original by Redshrike, mapped to all frames by Matthew Krohn & JaidynReiman
- Offered licenses: OGA-BY 3.0, CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles

### `eyes/human/adult/gray.png`

- Authors: Mark Weyer, Johannes Sjölund (wulax), Matthew Krohn (makrohn), Stephen Challener (Redshrike)
- Upstream notes: original by Redshrike, color by Mark Weyer & Wulax, mapped to all frames by Matthew Krohn & JaidynReiman
- Offered licenses: OGA-BY 3.0, CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- https://opengameart.org/content/lpc-medieval-fantasy-character-sprites

### `facial/glasses/glasses`

- Authors: ElizaWy
- Offered licenses: OGA-BY 3.0; selected: CC BY-SA 3.0
- https://github.com/ElizaWy/LPC/tree/main/Characters/Head%20Accessories
- https://opengameart.org/content/expanded-universal-lpc-spritesheet-idle-run-jump-lpc-revised-combat-and-assets

### `feet/shoes`

- Authors: bluecarrot16, Johannes Sjölund (wulax)
- Upstream notes: original by wulax, edited for v3 base by bluecarrot16
- Offered licenses: OGA-BY 3.0, CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/lpc-medieval-fantasy-character-sprites
- http://opengameart.org/content/lpc-clothing-updates

### `hair/bangs`

- Authors: Manuel Riecke (MrBeast)
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles

### `hair/bangsshort`

- Authors: Manuel Riecke (MrBeast)
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/lpc-medieval-fantasy-character-sprites

### `hair/messy2`

- Authors: Manuel Riecke (MrBeast)
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles

### `hair/plain`

- Authors: Manuel Riecke (MrBeast), Joe White
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- https://opengameart.org/content/ponytail-and-plain-hairstyles

### `hair/spiked`

- Authors: kcilds/Rocetti/Eredah
- Offered licenses: CC-BY 4.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/eredah-rpg-character-base-48x64-ongoing
- https://opengameart.org/content/lpc-hair

### `head/heads/human/male`

- Authors: bluecarrot16, Benjamin K. Smith (BenCreating), Stephen Challener (Redshrike)
- Upstream notes: original head by Redshrike, tweaks by BenCreating, modular version by bluecarrot16
- Offered licenses: OGA-BY 3.0, CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- https://opengameart.org/content/lpc-character-bases

### `legs/formal`

- Authors: bluecarrot16, Thane Brimhall (pennomi), laetissima, Stephen Challener (Redshrike)
- Upstream notes: Original pants by Stephen Challener (Redshrike), Formal Pants by Bluecarrot16, climb/jump/run/sit/emotes/revised combat by JaidynReiman
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- https://opengameart.org/content/lpc-medieval-fantasy-character-sprites
- https://opengameart.org/content/lpc-2-characters
- https://opengameart.org/content/lpc-gentleman
- https://opengameart.org/content/lpc-expanded-pants

### `neck/tie/necktie`

- Authors: JaidynReiman, bluecarrot16, Thane Brimhall (pennomi), laetissima, Makrohn
- Upstream notes: Originally by pennomi/laetissima/Makrohn, edited by bluecarrot16, animations and recolors by JaidynReiman
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/lpc-2-characters
- https://opengameart.org/content/lpc-gentleman

### `torso/clothes/longsleeve/formal`

- Authors: bluecarrot16, Thane Brimhall (pennomi), laetissima, Johannes Sjölund (wulax)
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/lpc-medieval-fantasy-character-sprites
- https://opengameart.org/content/lpc-2-characters
- https://opengameart.org/content/lpc-gentleman

### `torso/jacket/collared`

- Authors: bluecarrot16
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/lpc-gentleman
- https://opengameart.org/content/lpc-pirates

### `body/bodies/skeleton`

- Authors: bluecarrot16, Johannes Sj?lund (wulax), Stephen Challener (Redshrike)
- Offered licenses: CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- https://opengameart.org/content/lpc-medieval-fantasy-character-sprites
- https://opengameart.org/content/lpc-skeleton
- https://opengameart.org/content/lpc-character-bases

### `head/heads/skeleton`

- Authors: bluecarrot16, Johannes Sj?lund (wulax), Stephen Challener (Redshrike)
- Offered licenses: OGA-BY 3.0, CC-BY-SA 3.0, GPL 3.0; selected: CC BY-SA 3.0
- https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles
- https://opengameart.org/content/lpc-medieval-fantasy-character-sprites
- https://opengameart.org/content/lpc-skeleton
- https://opengameart.org/content/lpc-character-bases
