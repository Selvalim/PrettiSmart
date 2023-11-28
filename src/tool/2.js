function compareAndFindDifference(originalStr, appendedStr) {
    let extraPosition = -1;
    let appendedPart = '';

    // Find the position of the extra part
    for (let i = 0; i < originalStr.length; i++) {
        if (originalStr[i] !== appendedStr[i]) {
            extraPosition = i;
            appendedPart = appendedStr.substring(i);
            break;
        }
    }

    // If extra part is at the end of the appended string
    if (extraPosition === -1) {
        extraPosition = originalStr.length;
        appendedPart = appendedStr.substring(originalStr.length);
    }

    return { extraPosition, appendedPart };
}

// 测试
const str1 = "(-2)+If(STORAGE[2]==(-1),0,bvudivi(STORAGE[0],1+STORAGE[2]))";
const str2 = "(-1)+Concat(0,Extract(255,1,(-1)+If(STORAGE[2]==(-1),0,bvudivi(STORAGE[0],1+STORAGE[2]))))";

const { extraPosition, appendedPart } = compareAndFindDifference(str1, str2);

// extraPosition 输出插入指令的位置
console.log("Position of extra part:", extraPosition);

// appendedPart 输出指令的内容
console.log("Appended string part:", appendedPart);