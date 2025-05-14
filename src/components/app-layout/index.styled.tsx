import { styled } from "@mui/material";

export const AppLayoutWrapper = styled("div")`
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar content";
  grid-template-rows: auto 1fr;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  width: 100%;
  overflow: hidden; /* Prevent double scrollbars */
  
  &.sidebar-hidden {
    grid-template-columns: 0 1fr;
  }
  
  @media (max-width: 900px) {
    grid-template-columns: 0 1fr;
    
    &.sidebar-visible {
      grid-template-columns: 260px 1fr;
    }
  }
`;

export const HeaderArea = styled("header")`
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: 1100;
  height: 64px;
  width: 100%;
`;

export const SidebarArea = styled("aside")`
  grid-area: sidebar;
  position: relative;
  height: calc(100vh - 64px);
  overflow-y: auto;
`;

export const ContentArea = styled("main")`
  grid-area: content;
  overflow-y: auto;
  height: calc(100vh - 64px);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch; /* Changed from flex-start to stretch */
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.palette.background.default};
  box-sizing: border-box; /* Ensure padding is included in width calculation */
`;
