"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { IoPersonOutline } from "react-icons/io5";
import { Camera, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingLabelInput } from "@/components/shared/floating-label-input";
import { profileSchema, type ProfileFormData } from "@/lib/validations/profile";
import { FloatingPhoneInput } from "@/components/shared/floating-phone-input";

export function ProfileCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "Samuel",
      lastName: "Adebayo",
      email: "andrewowl@gmail.com",
      phone: "08123456789",
      location: "Lagos, Nigeria",
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  };

  const onSubmit = async (data: ProfileFormData) => {
    console.log("Profile updated:", data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="bg-background grid gap-4 md:gap-9  rounded-2xl w-full max-w-3xl">
      {/* Avatar + name row */}

      <div className="flex flex-col gap-2 md:gap-3 ">
        <div className="h-24 bg-muted rounded-t-2xl" />

        <div className="relative -mt-16 w-fit md:ml-4 px-4">
          <Avatar className="size-24 border-4 border-white">
            <AvatarImage src={avatar ?? undefined} alt="Samuel Adebayo" />
            <AvatarFallback className="text-2xl font-semibold bg-muted text-muted-foreground">
              SA
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera className="size-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Name + role */}
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-foreground">
              Samuel Adebayo
            </h2>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full ">
              Admin
            </Badge>
          </div>

          {!isEditing && (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Personal information */}
      <div className="px-4 pb-6 md:px-8 md:pb-10 ">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Personal Information
        </h3>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* First Name */}

              <FloatingLabelInput
                label="First Name"
                icon={
                  <IoPersonOutline className="size-4 text-muted-foreground" />
                }
                {...register("firstName")}
                error={errors.firstName?.message}
              />

              {/* Last Name */}

              <FloatingLabelInput
                label="Last Name"
                error={errors.lastName?.message}
                icon={
                  <IoPersonOutline className="size-4 text-muted-foreground" />
                }
                {...register("lastName")}
              />

              {/* Email */}

              <FloatingLabelInput
                label="Email Address"
                type="email"
                error={errors.email?.message}
                icon={<Mail className="size-4 text-muted-foreground" />}
                {...register("email")}
              />

              {/* Phone */}
              <div>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <FloatingPhoneInput
                      label="Phone Number"
                      icon={<Phone className="size-4" />}
                      placeholder="Enter phone number"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.phone?.message}
                    />
                  )}
                />
              </div>

              {/* Location */}

              <FloatingLabelInput
                label="Location"
                error={errors.location?.message}
                icon={<MapPin className="size-4 text-muted-foreground" />}
                {...register("location")}
              />
            </div>

            <div className="flex gap-2 justify-between w-fit md:w-full pt-3 md:pt-5 md:justify-end">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full md:px-5  md:max-w-56.5 w-full"
              >
                Save Profile
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                className="rounded-full md:px-5  md:max-w-56.5 w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: "First Name",
                value: "Samuel",
                icon: <IoPersonOutline className="size-4" />,
              },
              {
                label: "Last Name",
                value: "Adebayo",
                icon: <IoPersonOutline className="size-4" />,
              },
              {
                label: "Email Address",
                value: "andrewowl@gmail.com",
                icon: <Mail className="size-4" />,
              },
              {
                label: "Phone Number",
                value: "08123456789",
                icon: <Phone className="size-4" />,
              },
              {
                label: "Location",
                value: "Lagos, Nigeria",
                icon: <MapPin className="size-4" />,
              },
            ].map((field) => (
              <div
                key={field.label}
                className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3"
              >
                <span className="text-muted-foreground shrink-0">
                  {field.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground leading-none mb-1">
                    {field.label}
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {field.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
