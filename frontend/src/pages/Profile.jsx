import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Edit2, Mail, MapPin, Phone, Save, User, X } from "lucide-react";
import { useState } from "react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Deeksha Agarwal",
    email: "deeksha@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    joinDate: "January 2024",
    avatar: "/placeholder-avatar.jpg"
  });

  const [editData, setEditData] = useState(profileData);

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32 border-4 border-primary/20">
                <AvatarImage src={profileData.avatar} alt="Profile" />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="h-11"
                    />
                  ) : (
                    <p className="text-foreground font-medium p-3 bg-muted rounded-md">{profileData.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="h-11"
                    />
                  ) : (
                    <p className="text-foreground font-medium p-3 bg-muted rounded-md">{profileData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="h-11"
                    />
                  ) : (
                    <p className="text-foreground font-medium p-3 bg-muted rounded-md">{profileData.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      className="h-11"
                    />
                  ) : (
                    <p className="text-foreground font-medium p-3 bg-muted rounded-md">{profileData.location}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </Label>
                <p className="text-foreground font-medium p-3 bg-muted rounded-md">{profileData.joinDate}</p>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-semibold text-foreground">Change Password</h3>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <Button variant="outline">Change</Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-semibold text-foreground">Export Data</h3>
              <p className="text-sm text-muted-foreground">Download your expense and income data</p>
            </div>
            <Button variant="outline">Export</Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <h3 className="font-semibold text-destructive">Delete Account</h3>
              <p className="text-sm text-destructive/70">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;