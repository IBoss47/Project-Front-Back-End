import React, { useEffect, useState } from "react";
import UserProfile from "../components/User/UserProfile";
import UserSidebarMenu from "../components/User/UserSidebarMenu";
import DetailProfile from "../components/User/UserDetail/DetailProfile";
import DetailAutoReply from "../components/User/UserDetail/DetailAutoReply";
import DetailMyReview from "../components/User/UserDetail/DetailMyReview";
import DetailManageProfile from "../components/User/UserDetail/DetailManageProfile";
import DetailAccount from "../components/User/UserDetail/DetailAccount";
import axios from "axios";

export default function UserProfilePage() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("http://localhost:8080/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    loadUser();
  }, []);

  const detailComponent = {
    "ข้อมูลส่วนตัว": <DetailProfile user={user}/>,
    "ข้อความตอบกลับอัตโนมัติ": <DetailAutoReply />,
    "รีวิวของฉัน": <DetailMyReview />,
    "จัดการโปรไฟล์": <DetailManageProfile />,
    "จัดการบัญชี": <DetailAccount />,
  };

  const [activeMenu, setActiveMenu] = useState("ข้อมูลส่วนตัว");

  if (!user) {
    return <div>Loading...</div>;  // ⭐ ป้องกัน error
  }

  return (
    <>
      <div className="w-full flex justify-center px-6 pt-6 items-start">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 w-full max-w-6xl px-20">

          {/* Heading */}
          <div className="col-span-3 border-b mb-2">
            <h1 className="text-xl font-semibold">ข้อมูลส่วนตัว</h1>
          </div>

          {/* Profile (full width) */}
          <UserProfile
            name={user.username}
            memberId={user.id}
            avatar="/Images/cat.png"
          />

          {/* Menu (left) */}
          <div>
            <UserSidebarMenu
              active={activeMenu}
              onMenuClick={setActiveMenu}
            />
          </div>


          {/* Detail (right) */}
          <div className="col-span-2 bg-white border p-6 rounded">
            {detailComponent[activeMenu]}
          </div>

        </div>
      </div>
    </>
  );
}
