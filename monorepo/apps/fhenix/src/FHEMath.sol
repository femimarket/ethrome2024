// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@fhenixprotocol/contracts/FHE.sol";

library FheMath {
    uint32 constant private OFFSET = 1 << 31;

    function fromInt(int32 x) internal pure returns (euint32) {
        return FHE.asEuint32(uint32(x) + OFFSET);
    }

    function toInt(euint32 x) internal view returns (int32) {
        return int32(FHE.decrypt(x)) - int32(OFFSET);
    }

    function add(euint32 a, euint32 b) internal pure returns (euint32) {
        return FHE.sub(FHE.add(a, b), FHE.asEuint32(OFFSET));
    }

    function sub(euint32 a, euint32 b) internal pure returns (euint32) {
        return FHE.add(FHE.sub(a, b), FHE.asEuint32(OFFSET));
    }

    function negate(euint32 x) internal pure returns (euint32) {
        return FHE.sub(FHE.asEuint32(2 * OFFSET), x);
    }

    function mul(euint32 a, euint32 b) internal view returns (euint32) {
        ebool isNegativeA = FHE.lt(a, FHE.asEuint32(OFFSET));
        ebool isNegativeB = FHE.lt(b, FHE.asEuint32(OFFSET));
        ebool isNegative = FHE.xor(isNegativeA, isNegativeB);

        euint32 absA = FHE.select(isNegativeA, FHE.sub(FHE.asEuint32(OFFSET), a), FHE.sub(a, FHE.asEuint32(OFFSET)));
        euint32 absB = FHE.select(isNegativeB, FHE.sub(FHE.asEuint32(OFFSET), b), FHE.sub(b, FHE.asEuint32(OFFSET)));

        euint32 absResult = FHE.div(FHE.mul(absA, absB), FHE.asEuint32(OFFSET));
        return FHE.select(isNegative, FHE.sub(FHE.asEuint32(OFFSET), absResult), FHE.add(FHE.asEuint32(OFFSET), absResult));
    }

    function div(euint32 a, euint32 b) internal view returns (euint32) {
        FHE.req(FHE.ne(b, FHE.asEuint32(OFFSET)));

        ebool isNegativeA = FHE.lt(a, FHE.asEuint32(OFFSET));
        ebool isNegativeB = FHE.lt(b, FHE.asEuint32(OFFSET));
        ebool isNegative = FHE.xor(isNegativeA, isNegativeB);

        euint32 absA = FHE.select(isNegativeA, FHE.sub(FHE.asEuint32(OFFSET), a), FHE.sub(a, FHE.asEuint32(OFFSET)));
        euint32 absB = FHE.select(isNegativeB, FHE.sub(FHE.asEuint32(OFFSET), b), FHE.sub(b, FHE.asEuint32(OFFSET)));

        euint32 absResult = FHE.div(FHE.mul(absA, FHE.asEuint32(OFFSET)), absB);
        return FHE.select(isNegative, FHE.sub(FHE.asEuint32(OFFSET), absResult), FHE.add(FHE.asEuint32(OFFSET), absResult));
    }

    function isNegative(euint32 x) internal view returns (ebool) {
        return FHE.lt(x, FHE.asEuint32(OFFSET));
    }

    function abs(euint32 x) internal view returns (euint32) {
        ebool isNeg = FHE.lt(x, FHE.asEuint32(OFFSET));
        return FHE.select(isNeg, FHE.sub(FHE.asEuint32(2 * OFFSET), x), x);
    }
}