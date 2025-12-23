function clamp (v: number, lo: number, hi: number) {
    if (v < lo) {
        return lo
    }
    if (v > hi) {
        return hi
    }
    return v
}
// 把 1500 附近小抖動吃掉
function applyDeadband (pwm: number, center: number, band: number) {
    if (Math.abs(pwm - center) <= band) {
        return center
    }
    return pwm
}
let s = 0
let t = 0
let BLEInput = ""
let leftPwm = 0
let rightPwm = 0
function driveMotorFromPwm(motor: MyEnumMotor, pwm: number) {
    pwm = clamp(pwm, 1000, 2000)

    if (pwm >= 1500) {
        let spd = Math.map(pwm, 1500, 2000, 0, 255)
        DFRobotMaqueenPlusV2.controlMotor(motor, MyEnumDir.eForward, spd)
    } else {
        let spd2 = Math.map(pwm, 1500, 1000, 0, 255)
        DFRobotMaqueenPlusV2.controlMotor(motor, MyEnumDir.eBackward, spd2)
    }
}
let P0String = "1500"
let P1String = "1500"
let P2String = "1500"
let P3String = "1500"
// throttle
let ch1 = 1500
// steering
let ch2 = 1500
let ch3 = 1500
let ch4 = 1500
basic.forever(function () {
    BLEInput = bluetooth.uartReadUntil(serial.delimiters(Delimiters.Hash))
    // 預期格式：SRT + 4ch(每個4字元) => 3 + 16 = 19
    if (BLEInput.length != 19) {
        return
    }
    if (BLEInput.substr(0, 3) != "SRT") {
        return
    }
    // CH1
    P0String = BLEInput.substr(3, 4)
    // CH2
    P1String = BLEInput.substr(7, 4)
    // CH3
    P2String = BLEInput.substr(11, 4)
    // CH4
    P3String = BLEInput.substr(15, 4)
    ch1 = parseFloat(P0String)
    ch2 = parseFloat(P1String)
    ch3 = parseFloat(P2String)
    ch4 = parseFloat(P3String)
    // deadband：避免抖動（可調 10~30）
    ch1 = applyDeadband(ch1, 1500, 10)
    ch2 = applyDeadband(ch2, 1500, 10)
    // ===== 坦克混控 (throttle + steering) =====
    // throttle: ch1, steering: ch2
    // 先換算成 -500..+500 的偏移量
    t = ch2 - 1500
    s = (ch1 - 1500) * -1

    let TURN_RATIO = 0.6         // 0.5~0.8 建議，越小越像「45度大弧線」
    let THROTTLE_SPIN_ZONE = 60  // 油門小於這個範圍，允許原地轉向(單位=PWM)

    if (Math.abs(t) > THROTTLE_SPIN_ZONE) {
        // 有在走路時：限制轉向不超過油門的一定比例，避免內輪被抵消到停
        let sLimit = Math.abs(t) * TURN_RATIO
        s = clamp(s, -sLimit, sLimit)
    }

    // 左右輪 PWM（1500 為停）
    leftPwm = 1500 + t - s
    rightPwm = 1500 + t + s
    leftPwm = clamp(leftPwm, 1000, 2000)
    rightPwm = clamp(rightPwm, 1000, 2000)
    driveMotorFromPwm(MyEnumMotor.eLeftMotor, leftPwm)
driveMotorFromPwm(MyEnumMotor.eRightMotor, rightPwm)
})
