/*
 rgbultrasonic package
*/
//% weight=10 icon="\uf013" color=#ff7f00
namespace rgbultrasonic {
    const Sonar_I2C_ADDR = 0x77;

    const RGB_MODE = 2

    const RGB1_R = 3
    const RGB1_G = 4
    const RGB1_B = 5
    const RGB2_R = 6
    const RGB2_G = 7
    const RGB2_B = 8

    const RGB1_R_BREATHING_CYCLE = 9
    const RGB1_G_BREATHING_CYCLE = 10
    const RGB1_B_BREATHING_CYCLE = 11
    const RGB2_R_BREATHING_CYCLE = 12
    const RGB2_G_BREATHING_CYCLE = 13
    const RGB2_B_BREATHING_CYCLE = 14

    export enum RGBMode {
        //% block="rgb"
        rgb = 0,
        //% block="breathing"
        breathing = 1,
    }

    export enum RGBNum {
        //% block="left"
        left = 0,
        //% block="right"
        right = 1,
        //% block="all"
        all = 2,
    }

    function i2cwrite(adress: number, reg: number, value: number) {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(adress, buf);
    }

    function i2cread(adress: number, reg: number): number {
        pins.i2cWriteNumber(adress, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(adress, NumberFormat.UInt8BE);
        return val;
    }

    function WireWriteDataArray(addr: number, reg: number, val: number): boolean {
        let buf2 = pins.createBuffer(3);
        buf2[0] = reg;
        buf2[1] = val & 0xff;
        buf2[2] = (val >> 8) & 0xff;
        let rvalue2 = pins.i2cWriteBuffer(addr, buf2);
        if (rvalue2 != 0) {
            return false;
        }
        return true;
    }

    //% weight=90 blockId=SETRGB block="Set Mode|%mode LED|%index RGB|%r|%g|%b| pins(P19:SCL,P20:SDA)"
    //% r.min=0 r.max=255 g.min=0 g.max=255 b.min=0 b.max=255
    //% inlineInputMode=inline
    export function SETRGB(mode: RGBMode, index: RGBNum, r: number, g: number, b: number) {
         WireWriteDataArray(Sonar_I2C_ADDR, RGB_MODE, mode);
        let start_reg = 3;  
        
        if (mode == RGBMode.breathing) {         
            start_reg = 9;
            r = r * 10;
            g = g * 10;
            b = b * 10;        
        }
        else {
            if (r == 0 && g == 0 && b == 0) {
                let buf4 = pins.createBuffer(7); 
                buf4[0] = 0x09;
                buf4[1] = 0x00;
                buf4[2] = 0x00;
                buf4[3] = 0x00;
                buf4[4] = 0x00;
                buf4[5] = 0x00;
                buf4[6] = 0x00;
                pins.i2cWriteBuffer(Sonar_I2C_ADDR, buf4);
            }
        }
        if (index != RGBNum.all) { 
            let buf5 = pins.createBuffer(4);
            if (index == RGBNum.left && mode == RGBMode.rgb) {
                start_reg = 6;
            } 
            else if (index == RGBNum.left && mode == RGBMode.breathing) {
                start_reg = 12;
            }                     
            buf5[0] = start_reg & 0xff;
            buf5[1] = r & 0xff;
            buf5[2] = g & 0xff;
            buf5[3] = b & 0xff;
            pins.i2cWriteBuffer(Sonar_I2C_ADDR, buf5);
        }
        else {
            let buf6 = pins.createBuffer(7); 
            buf6[0] = start_reg & 0xff;
            buf6[1] = r & 0xff;
            buf6[2] = g & 0xff;
            buf6[3] = b & 0xff;
            buf6[4] = r & 0xff;
            buf6[5] = g & 0xff;
            buf6[6] = b & 0xff;
            pins.i2cWriteBuffer(Sonar_I2C_ADDR, buf6);
        }      
    }

    //% weight=89 blockId=GETDISTANCE block="Get Distance(mm) pins(P19:SCL,P20:SDA)"
    export function GETDISTANCE():number {
        let distance = i2cread(Sonar_I2C_ADDR, 0) + i2cread(Sonar_I2C_ADDR, 1) * 256;
        if (distance > 65500)
            distance = 0
        return distance;
    }

}
