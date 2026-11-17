import { create } from 'zustand';
type UiState = { sidebarOpen:boolean; viewMode:'table'|'cards'; setSidebarOpen:(open:boolean)=>void; setViewMode:(mode:'table'|'cards')=>void };
export const useUiStore = create<UiState>((set)=>({sidebarOpen:false,viewMode:'table',setSidebarOpen:(sidebarOpen)=>set({sidebarOpen}),setViewMode:(viewMode)=>set({viewMode})}));
