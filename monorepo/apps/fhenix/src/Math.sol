// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

library Math {
    uint32 constant private OFFSET = 1 << 31;

    function fromInt(int32 x) internal pure returns (uint32) {
        return uint32(x) + OFFSET;
    }

    function toInt(uint32 x) internal pure returns (int32) {
        return int32(x) - int32(OFFSET);
    }

    function add(uint32 a, uint32 b) internal pure returns (uint32) {
        return a + b - OFFSET;
    }

    function sub(uint32 a, uint32 b) internal pure returns (uint32) {
        return a - b + OFFSET;
    }

    function negate(uint32 x) internal pure returns (uint32) {
        return 2 * OFFSET - x;
    }

    function mul(uint32 a, uint32 b) internal pure returns (uint32) {
        bool isNegativeA = a < OFFSET;
        bool isNegativeB = b < OFFSET;
        bool isNegative = isNegativeA != isNegativeB;

        uint32 absA = isNegativeA ? OFFSET - a : a - OFFSET;
        uint32 absB = isNegativeB ? OFFSET - b : b - OFFSET;

        uint32 absResult = (absA * absB) / OFFSET;
        return isNegative ? OFFSET - absResult : OFFSET + absResult;
    }

    function div(uint32 a, uint32 b) internal pure returns (uint32) {
        require(b != OFFSET, "Math: division by zero");

        bool isNegativeA = a < OFFSET;
        bool isNegativeB = b < OFFSET;
        bool isNegative = isNegativeA != isNegativeB;

        uint32 absA = isNegativeA ? OFFSET - a : a - OFFSET;
        uint32 absB = isNegativeB ? OFFSET - b : b - OFFSET;

        uint32 absResult = (absA * OFFSET) / absB;
        return isNegative ? OFFSET - absResult : OFFSET + absResult;
    }

    function isNegative(uint32 x) internal pure returns (bool) {
        return x < OFFSET;
    }

    function abs(uint32 x) internal pure returns (uint32) {
        return x < OFFSET ? 2 * OFFSET - x : x;
    }
}