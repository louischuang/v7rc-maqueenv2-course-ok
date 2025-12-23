bluetooth.onBluetoothConnected(function () {
    basic.showLeds(`
        . . . . .
        . . . . .
        # # . # #
        . . . . .
        . . . . .
        `)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showLeds(`
        . . . . .
        . # . # .
        . . # . .
        . # # # .
        . # . # .
        `)
})
let BLEInput = ""
DFRobotMaqueenPlusV2.I2CInit()
bluetooth.startUartService()
bluetooth.setTransmitPower(7)
basic.showLeds(`
    . . . . .
    . . . . #
    . . . # .
    # . # . .
    . # . . .
    `)
let P0String = "1500"
let P1String = "1500"
let P2String = "1500"
let P3String = "1500"
let TankP0 = 1500
let TankP1 = 1500
let Channel1Value = parseFloat(P0String)
let Channel2Value = parseFloat(P1String)
let Channel3Value = parseFloat(P2String)
let Channel4Value = parseFloat(P3String)
DFRobotMaqueenPlusV2.controlMotorStop(MyEnumMotor.eAllMotor)
DFRobotMaqueenPlusV2.controlLED(MyEnumLed.eAllLed, MyEnumSwitch.eOpen)
basic.forever(function () {
    BLEInput = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Hash))
    if (BLEInput.length == 19) {
        if (BLEInput.substr(0, 3) == "SRT") {
            P0String = BLEInput.substr(3, 4)
            P1String = BLEInput.substr(7, 4)
            P2String = BLEInput.substr(11, 4)
            Channel1Value = parseFloat(P0String)
            Channel2Value = parseFloat(P1String)
            Channel3Value = parseFloat(P2String)
            TankP0 = 1500
            TankP1 = 1500
            if (Channel2Value >= 1500) {
                TankP1 = TankP1 + (Channel2Value - 1500)
                TankP0 = TankP0 - (Channel2Value - 1500)
            } else {
                TankP1 = TankP1 - (1500 - Channel2Value)
                TankP0 = TankP0 + (1500 - Channel2Value)
            }
            if (Channel1Value >= 1500) {
                TankP1 = TankP1 + (Channel1Value - 1500)
                TankP0 = TankP0 + (Channel1Value - 1500)
            } else {
                TankP1 = TankP1 - (1500 - Channel1Value)
                TankP0 = TankP0 - (1500 - Channel1Value)
            }
            if (TankP0 < 1000) {
                TankP0 = 1000
            }
            if (TankP0 > 2000) {
                TankP0 = 2000
            }
            if (TankP1 > 2000) {
                TankP1 = 2000
            }
            if (TankP1 < 1000) {
                TankP1 = 1000
            }
            if (TankP0 < 1500) {
                TankP0 = Math.map(TankP0, 1500, 2000, 0, 100)
                DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eLeftMotor, MyEnumDir.eForward, TankP0)
            } else {
                TankP0 = Math.map(TankP0, 1500, 1000, 0, 100)
                DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eLeftMotor, MyEnumDir.eBackward, TankP0)
            }
            if (TankP1 < 1500) {
                TankP1 = Math.map(TankP1, 1500, 2000, 0, 100)
                DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eRightMotor, MyEnumDir.eBackward, TankP1)
            } else {
                TankP1 = Math.map(TankP1, 1500, 1000, 0, 100)
                DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eRightMotor, MyEnumDir.eForward, TankP1)
            }
        }
    }
})
