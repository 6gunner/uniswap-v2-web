import { formattedNum } from "../swapInfo";

describe("formattedNum", () => {
  // 测试无效输入
  test("handles invalid inputs", () => {
    expect(formattedNum("")).toBe(0);
    expect(formattedNum(undefined)).toBe(0);
    expect(formattedNum(null)).toBe(0);
    expect(formattedNum(NaN)).toBe(0);
    expect(formattedNum("invalid")).toBe(0);
  });

  // 测试 USD 格式的无效输入
  test("handles invalid inputs with USD", () => {
    expect(formattedNum("", true)).toBe("$0");
    expect(formattedNum(undefined, true)).toBe("$0");
    expect(formattedNum(null, true)).toBe("$0");
    expect(formattedNum(NaN, true)).toBe("$0");
  });

  // 测试负数处理
  test("handles negative numbers", () => {
    expect(formattedNum(-100)).toBe(0);
    expect(formattedNum(-100, true)).toBe("$0");
    expect(formattedNum(-100, false, true)).toBe("-100");
    expect(formattedNum(-100, true, true)).toBe("-$100.00");
  });

  // 测试大数字
  test("handles large numbers", () => {
    expect(formattedNum(500000001)).toBe("500m");
    expect(formattedNum(500000001, true)).toBe("$500m");
  });

  // 测试零值
  test("handles zero", () => {
    expect(formattedNum(0)).toBe(0);
    expect(formattedNum(0, true)).toBe("$0");
  });

  // 测试小数
  test("handles small decimals", () => {
    expect(formattedNum(0.00009)).toBe("< 0.0001");
    expect(formattedNum(0.00009, true)).toBe("< $0.0001");
  });

  // 测试千位以上数字
  test("handles numbers over 1000", () => {
    expect(formattedNum(1234)).toBe("1,234");
    expect(formattedNum(1234, true)).toBe("$1,234");
  });

  // 测试小于 0.1 的 USD 值
  test("handles USD values less than 0.1", () => {
    expect(formattedNum(0.05, true)).toBe("$0.0500");
  });

  // 测试普通 USD 值
  test("handles normal USD values", () => {
    expect(formattedNum(1.23, true)).toBe("$1.23");
  });

  // 测试普通数值
  test("handles normal numbers", () => {
    expect(formattedNum(1.2345)).toBe("1.2345");
  });
});
