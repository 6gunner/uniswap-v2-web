declare module "*.gif";
declare module "*.svg";
declare module "*.png";
declare module "*.webp" {
  const content: string;
  export default content;
}
