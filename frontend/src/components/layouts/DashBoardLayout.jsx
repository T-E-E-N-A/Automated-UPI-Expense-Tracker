
import Navbar from './Navbar';
import SideMenu from './SideMenu';



const DashBoardLayout = ({ children, activeMenu }) => {
    // const { user } = useContext(UserContext)
    // console.log("User in Dashboard:", user);
    return (
        <div>
            <Navbar activeMenu={activeMenu} />
                    <div className='flex'>
                        <div className='max-[2000px]:hidden'>
                            <SideMenu activeMenu={activeMenu} />
                        </div>
                    </div>
                    <div className=''>
                        {children}
                    </div>
                
        </div>
    )
}

export default DashBoardLayout;
