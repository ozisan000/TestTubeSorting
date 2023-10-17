
/**
* このファイルを使って、独自の関数やブロックを定義してください。
* 詳しくはこちらを参照してください：https://minecraft.makecode.com/blocks/custom
*/
/**
 * laboratoryofpharmacology
 */
//% weight=100 color=#008080 icon="×"
namespace pharmacology {

    let N = 0
    // 空気
    let R = 1
    // 赤 右
    let G = 2
    // 緑
    let B = 3
    // 青
    let K = 4
    // 黒
    let L = 0
    // 左
    let A = 2
    // 選択
    let limit = 70
    // 制限時間
    let clearTubes = 4
    // 揃えられた試験管の数
    let selectTube = 0
    // カーソルの位置
    let copyTube = 0
    // 選択元試験管
    let copyRow = 0
    // 選択された段
    let isSelect = false
    // 選択中か
    let isClear = false
    // ゲームをクリアしたかどうか
    let putPos = world(-15, -15, 28)
    // 上段　下段
    //  startTube = [
    //      [G,R],
    //      [B,G],
    //      [R,K],
    //      [K,B],
    //      [N,N],
    //  ]
    let startTube = [
        [G, K],
        [B, R],
        [R, G],
        [K, B],
        [N, N]]
    // 上段　下段（試験管の座標）
    let tubePos = [
        [[17, 2, 15], [17, 1, 15]],
        [[17, 2, 17], [17, 1, 17]],
        [[17, 2, 19], [17, 1, 19]],
        [[17, 2, 21], [17, 1, 21]],
        [[17, 2, 23], [17, 1, 23]]]

    // カーソルの座標
    let cursorPos = [
        [18, 3, 15],
        [18, 3, 17],
        [18, 3, 19],
        [18, 3, 21],
        [18, 3, 23]]
    // ボタン入力検出用座標
    let selectPosList = [
        [19, -2, 21],
        [19, -2, 17],
        [19, -2, 19]]
    // L
    // R
    // Ac
    let tube = startTube
    let time = limit
    // ゲームが終了しかどうか
    function IsEnd() {

        return 0 < time && !isClear
    }

    // 色のIDをブロックのIDに変換する
    function ConvertBlock(bid: number): number {
        if (bid == N) {
            return AIR
        } else if (bid == R) {
            return RED_STAINED_GLASS
        } else if (bid == G) {
            return GREEN_STAINED_GLASS
        } else if (bid == B) {
            return BLUE_STAINED_GLASS
        } else if (bid == K) {
            return BLACK_STAINED_GLASS
        }

        return -1
    }

    // 初期化
    function Init() {
        let i: number;

        for (i = 0; i < 3; i += 1) {
            blocks.place(AIR, world(selectPosList[i][0], selectPosList[i][1], selectPosList[i][2]))
        }
        for (i = 0; i < 5; i += 1) {
            for (let j = 0; j < 2; j += 1) {
                blocks.place(ConvertBlock(N), world(tubePos[i][j][0], tubePos[i][j][1], tubePos[i][j][2]))
                blocks.place(ConvertBlock(tube[i][j]), world(tubePos[i][j][0], tubePos[i][j][1], tubePos[i][j][2]))

            }
        }

    }

    // 試験官が正しい配列かを調べ、正しい場合クリア判定にする
    function CheckClear() {

        let clear = clearTubes
        for (let i = 0; i < 5; i += 1) {
            if (tube[i][0] != N && tube[i][0] == tube[i][1]) {
                clear -= 1
            }

        }
        if (clear <= 0) {
            isClear = true
        }

    }

    // 時間制限タイマー
    // 選択ボタンを押したときの挙動
    function Accept() {
        let j: number;
        let underCol: number;
        let p: number[];

        if (!isSelect) {
            // 選択されてない場合
            for (j = 0; j < 2; j += 1) {
                if (tube[selectTube][j] != N) {
                    copyTube = selectTube
                    copyRow = j
                    isSelect = true
                    return
                }

            }
        } else if (copyTube != selectTube) {
            // 選択された試験官と違う試験管を選択した場合
            underCol = N
            // 下の層の色
            for (j = 1; j > -1; j += -1) {
                // 選択した試験管の層 == 空気 && ((選択先の下層の色 == コピー元の試験官の色) || (選択先の下層の色 == 空気))
                if (tube[selectTube][j] == N && (underCol == tube[copyTube][copyRow] || underCol == N)) {
                    player.say("set:" + tube[copyTube][copyRow])
                    tube[selectTube][j] = tube[copyTube][copyRow]
                    p = tubePos[copyTube][copyRow]
                    blocks.place(ConvertBlock(N), world(p[0], p[1], p[2]))
                    blocks.place(ConvertBlock(tube[copyTube][copyRow]), world(tubePos[selectTube][j][0], tubePos[selectTube][j][1], tubePos[selectTube][j][2]))
                    tube[copyTube][copyRow] = N
                    CheckClear()
                    break
                } else if (tube[selectTube][j] != N) {
                    // 試験管の下層に色が存在する場合
                    underCol = tube[selectTube][j]
                    player.say("under:" + underCol)
                }

            }
        }

        isSelect = false
    }

    // 選択カーソルの座標と色を変更する
    function SetCursor() {

        blocks.fill(AIR, world(cursorPos[0][0], cursorPos[0][1], cursorPos[0][2]), world(cursorPos[4][0], cursorPos[4][1], cursorPos[4][2]), FillOperation.Replace)
        let placeBlockName = " torch replace"
        if (isSelect) {
            placeBlockName = " soul_torch replace"
        }

        player.execute("/setblock " + cursorPos[selectTube][0] + " " + cursorPos[selectTube][1] + " " + cursorPos[selectTube][2] + placeBlockName)
    }

    /**
     * TODO: 試験管ゲーム
     */
    //% block
    export function TestTubeSortingGame() {
        let isClick: boolean;
        let clickPos: Position;

        // 初期化
        Init()
        loops.runInBackground(function Timer() {

            while (IsEnd()) {
                loops.pause(1000)
                time -= 1
                if (time % 10 == 0) {
                    player.say(time + "s")
                }

            }
        })
        gameplay.title(mobs.target(ALL_PLAYERS), "Start!", "")
        let LPos = world(selectPosList[L][0], selectPosList[L][1], selectPosList[L][2])
        let RPos = world(selectPosList[R][0], selectPosList[R][1], selectPosList[R][2])
        let APos = world(selectPosList[A][0], selectPosList[A][1], selectPosList[A][2])
        // カーソルを表示
        SetCursor()
        // メインループ
        while (IsEnd()) {
            isClick = false
            clickPos = null
            if (blocks.testForBlock(EMERALD_BLOCK, LPos)) {
                // 左カーソル
                clickPos = LPos
                if (4 > selectTube) {
                    selectTube += 1
                }

                SetCursor()
                isClick = true

            } else if (blocks.testForBlock(EMERALD_BLOCK, RPos)) {
                // 右カーソル
                clickPos = RPos
                if (0 < selectTube) {
                    selectTube -= 1
                }

                SetCursor()
                isClick = true

            } else if (blocks.testForBlock(EMERALD_BLOCK, APos)) {
                // 決定
                clickPos = APos
                Accept()
                SetCursor()
                isClick = true

            }

            if (isClick) {
                blocks.place(AIR, clickPos)
            }

        }
        // ゲーム終了処理
        if (isClear) {
            gameplay.title(mobs.target(ALL_PLAYERS), "Clear!", "")
            blocks.place(REDSTONE_BLOCK, putPos)
        } else {
            gameplay.title(mobs.target(ALL_PLAYERS), "GameOver!", "")
        }

    }
}
