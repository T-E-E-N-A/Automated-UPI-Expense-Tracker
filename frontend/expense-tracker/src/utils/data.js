import { LuHandCoins, LuLayoutDashboard, LuLogOut, LuWalletMinimal } from 'react-icons/lu';

export const sideMenuData = [
    {
        id:1,
        label : "Dashboard",
        icon : LuLayoutDashboard,
        path : "/dashboard"
    },
    {
        id:2,
        label : "Income",
        icon : LuWalletMinimal,
        path : "/income"
    },
    {
        id:3,
        label : "Expense",
        icon : LuHandCoins,
        path : "/expence"
    },
    {
        id:4,
        label : "Logout",
        icon : LuLogOut,
        path : "/login"
    },
];