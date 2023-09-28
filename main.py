N = 0 #空気
R = 1 #赤 右
G = 2 #緑
B = 3 #青
K = 4 #黒

L = 0 #左
A = 2 #選択

limit = 70 #制限時間
clearTubes = 4 #揃えられた試験管の数
selectTube = 0 #カーソルの位置
copyTube = 0 #選択元試験管
copyRow = 0 #選択された段
isSelect = False #選択中か
isClear = False #ゲームをクリアしたかどうか

putPos = world(-15,-15,28)

#上段　下段
# startTube = [
#     [G,R],
#     [B,G],
#     [R,K],
#     [K,B],
#     [N,N],
# ]
startTube = [
    [G,K],
    [B,R],
    [R,G],
    [K,B],
    [N,N],
]

#上段　下段（試験管の座標）
tubePos = [
    [[17,2,15],[17,1,15]],
    [[17,2,17],[17,1,17]],
    [[17,2,19],[17,1,19]],
    [[17,2,21],[17,1,21]],
    [[17,2,23],[17,1,23]],
]

#カーソルの座標
cursorPos = [
    [18,3,15],
    [18,3,17],
    [18,3,19],
    [18,3,21],
    [18,3,23],
]

#ボタン入力検出用座標
selectPosList = [
    [19,-2,21], #L
    [19,-2,17], #R
    [19,-2,19] #Ac
]

tube = startTube
time = limit

#ゲームが終了しかどうか
def IsEnd():
    global time,isClear
    return  0 < time and (not isClear)

#色のIDをブロックのIDに変換する
def ConvertBlock(bid):
    if bid == N:
        return AIR
    elif bid == R:
        return RED_STAINED_GLASS
    elif bid == G:
        return GREEN_STAINED_GLASS
    elif bid == B:
        return BLUE_STAINED_GLASS
    elif bid == K:
        return BLACK_STAINED_GLASS
    return -1

#初期化
def Init():
    global tube,startTube,tubePos

    for i in range(0,3,1):
        blocks.place(AIR,world(selectPosList[i][0],selectPosList[i][1],selectPosList[i][2]))

    for i in range(0,5,1):
        for j in range(0,2,1):
            blocks.place(ConvertBlock(tube[i][j]), world(tubePos[i][j][0],tubePos[i][j][1],tubePos[i][j][2]))
            pass
    pass

#試験官が正しい配列かを調べ、正しい場合クリア判定にする
def CheckClear():
    global clearTubes,tube,isClear
    clear = clearTubes
    for i in range(0,5,1):
        if tube[i][0] != N and tube[i][0] == tube[i][1]:
            clear -= 1
    if clear <= 0:
        isClear = True

#時間制限タイマー
def Timer():
    global time
    while IsEnd():
        loops.pause(1000)
        time -= 1
        if (time % 10) == 0:
            player.say(time + "s")

#選択ボタンを押したときの挙動
def Accept():
    global isSelect,selectTube,tubePos,copyTube,copyRow
    if not isSelect:#選択されてない場合
        for j in range(0,2,1):
            if tube[selectTube][j] != N:
                copyTube = selectTube
                copyRow = j
                isSelect = True
                return
    elif copyTube != selectTube:#選択された試験官と違う試験管を選択した場合
        underCol = N #下の層の色
        for j in range(1,-1,-1):
            #選択した試験管の層 == 空気 && ((選択先の下層の色 == コピー元の試験官の色) || (選択先の下層の色 == 空気))
            if tube[selectTube][j] == N and (underCol == tube[copyTube][copyRow] or underCol == N):
                player.say("set:" + tube[copyTube][copyRow])
                tube[selectTube][j] = tube[copyTube][copyRow]

                p = tubePos[copyTube][copyRow]
                blocks.place(ConvertBlock(N), world(p[0],p[1],p[2]))

                blocks.place(ConvertBlock(tube[copyTube][copyRow]), \
                world(tubePos[selectTube][j][0],tubePos[selectTube][j][1],tubePos[selectTube][j][2]))

                tube[copyTube][copyRow] = N
                CheckClear()
                break
            elif tube[selectTube][j] != N: #試験管の下層に色が存在する場合
                underCol = tube[selectTube][j]
                player.say("under:" + underCol)
    isSelect = False

#選択カーソルの座標と色を変更する
def SetCursor():
    global selectTube,isSelect
    blocks.fill(AIR, \
    world(cursorPos[0][0],cursorPos[0][1],cursorPos[0][2]), \
    world(cursorPos[4][0],cursorPos[4][1],cursorPos[4][2]), FillOperation.REPLACE)
    placeBlockName = ' torch replace'
    if isSelect:
        placeBlockName = ' soul_torch replace'
    player.execute('/setblock '+cursorPos[selectTube][0]+' '+cursorPos[selectTube][1]+' '+cursorPos[selectTube][2] + placeBlockName)

def Main():
    global isClear, selectTube,putPos

    #初期化
    Init()
    loops.run_in_background(Timer)
    gameplay.title(mobs.target(ALL_PLAYERS), "Start!", "")
    LPos = world(selectPosList[L][0],selectPosList[L][1],selectPosList[L][2])
    RPos = world(selectPosList[R][0],selectPosList[R][1],selectPosList[R][2])
    APos = world(selectPosList[A][0],selectPosList[A][1],selectPosList[A][2])
    
    #カーソルを表示
    SetCursor()

    #メインループ
    while IsEnd():
        isClick = False
        clickPos = None
        if blocks.test_for_block(EMERALD_BLOCK, LPos):#左カーソル
            clickPos = LPos
            if 4 > selectTube :
                selectTube += 1
            SetCursor()
            isClick = True
            pass
        elif blocks.test_for_block(EMERALD_BLOCK, RPos):#右カーソル
            clickPos = RPos
            if 0 < selectTube :
                selectTube -= 1
            SetCursor()
            isClick = True
            pass
        elif blocks.test_for_block(EMERALD_BLOCK, APos): #決定
            clickPos = APos
            Accept()
            SetCursor()
            isClick = True
            pass

        if isClick:
            blocks.place(AIR,clickPos)
    
    #ゲーム終了処理
    if isClear:
        gameplay.title(mobs.target(ALL_PLAYERS), "Clear!", "")
        blocks.place(REDSTONE_BLOCK,putPos)
    else:
        gameplay.title(mobs.target(ALL_PLAYERS), "GameOver!", "")


Main()