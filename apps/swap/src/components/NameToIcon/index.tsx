import { Avatar } from "antd";
import styled from "styled-components";
import defaultIcon from "@src/assets/images/default-icon.svg?url";

const getLetterColor = (letter: string): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const index = letters.indexOf(letter.toUpperCase());

  if (index === -1) {
    return "#fff";
  }

  // 计算色相值，范围从0到360
  const hue = (index / 25) * 360;

  // 饱和度和亮度固定为85%和60%
  // 亮色为饱和度100，亮度70
  const saturation = 72;
  const lightness = 72;

  // 将HSL转换为CSS中的hsl()格式
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const CustomAvatar = styled(Avatar)<{ letter?: string }>`
  border: none;
  background: ${({ letter }) => letter && getLetterColor(letter)};
`;

export const NameToIcon = ({ size, name, ...rest }: { size?: number; name?: string }) => {
  if (!name) {
    return <img src={defaultIcon} alt="default" />;
  }

  const letter = name.slice(0, 1);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const index = letters.indexOf(letter.toUpperCase());

  if (index === -1) {
    return <img src={defaultIcon} alt="default" />;
  }

  return (
    <CustomAvatar {...rest} size={size} alt={"token"} letter={name?.slice(0, 1)}>
      {name?.slice(0, 1)}
    </CustomAvatar>
  );
};
