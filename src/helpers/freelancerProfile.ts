import { UserProfile } from "../types";

type IdLike =
  | string
  | number
  | null
  | undefined
  | {
      id?: string | number | null;
      _id?: string | number | null;
    };

type UserLike = {
  profile?: Partial<UserProfile> | null;
  role?: string | null;
  hasServiceProfile?: boolean | null;
  freelancer?: IdLike;
  freelancerId?: IdLike;
  freelancerProfile?: IdLike;
  freelancerProfileId?: IdLike;
};

export const getFreelancerId = (value: IdLike): string | number | null => {
  if (!value) return null;

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return value.id ?? value._id ?? null;
};

export const getFreelancerProfileState = (
  user: UserLike | null | undefined
) => {
  const profile = user?.profile ?? {};

  const freelancerId =
    getFreelancerId(profile.freelancer) ||
    getFreelancerId(profile.freelancerId) ||
    getFreelancerId(profile.freelancerProfile) ||
    getFreelancerId(profile.freelancerProfileId) ||
    getFreelancerId(user?.freelancer) ||
    getFreelancerId(user?.freelancerId) ||
    getFreelancerId(user?.freelancerProfile) ||
    getFreelancerId(user?.freelancerProfileId);

  const hasFreelancerProfile = Boolean(
    freelancerId ||
      profile.role === "freelancer" ||
      user?.role === "freelancer" ||
      profile.hasServiceProfile ||
      user?.hasServiceProfile
  );

  return {
    freelancerId,
    hasFreelancerProfile,
  };
};

export const normalizeUserProfile = (
  userData: Record<string, any> = {},
  fallbackProfile: Partial<UserProfile> = {}
): UserProfile => {
  const nestedProfile =
    userData?.profile && typeof userData.profile === "object"
      ? userData.profile
      : {};

  const fullName =
    userData.fullName ??
    nestedProfile.fullName ??
    fallbackProfile.fullName ??
    null;
  const gender =
    userData.gender ?? nestedProfile.gender ?? fallbackProfile.gender ?? null;
  const email =
    userData.email ?? nestedProfile.email ?? fallbackProfile.email ?? null;
  const address =
    userData.address ?? nestedProfile.address ?? fallbackProfile.address ?? null;
  const phone =
    userData.phone ?? nestedProfile.phone ?? fallbackProfile.phone ?? null;
  const referralCode =
    userData.referralCode ??
    nestedProfile.referralCode ??
    fallbackProfile.referralCode ??
    "";
  const userID = String(
    userData.id ?? nestedProfile.userID ?? fallbackProfile.userID ?? ""
  );
  const role =
    userData.role ?? nestedProfile.role ?? fallbackProfile.role ?? "user";
  // Profile picture — try all possible field names the backend might use
  const profilePic =
    userData.profilePic ??
    userData.profilePicture ??
    userData.avatar ??
    userData.photo ??
    nestedProfile.profilePic ??
    nestedProfile.profilePicture ??
    nestedProfile.avatar ??
    fallbackProfile.profilePic ??
    null;
  // Username
  const username =
    userData.username ??
    nestedProfile.username ??
    fallbackProfile.username ??
    null;
  const freelancer =
    userData.freelancer ??
    nestedProfile.freelancer ??
    fallbackProfile.freelancer ??
    null;
  const freelancerId =
    userData.freelancerId ??
    nestedProfile.freelancerId ??
    fallbackProfile.freelancerId ??
    null;
  const freelancerProfile =
    userData.freelancerProfile ??
    nestedProfile.freelancerProfile ??
    fallbackProfile.freelancerProfile ??
    null;
  const freelancerProfileId =
    userData.freelancerProfileId ??
    nestedProfile.freelancerProfileId ??
    fallbackProfile.freelancerProfileId ??
    null;

  const hasServiceProfile = Boolean(
    getFreelancerId(freelancer) ||
      getFreelancerId(freelancerId) ||
      getFreelancerId(freelancerProfile) ||
      getFreelancerId(freelancerProfileId) ||
      role === "freelancer" ||
      userData.hasServiceProfile ||
      nestedProfile.hasServiceProfile ||
      fallbackProfile.hasServiceProfile
  );

  return {
    fullName,
    gender,
    email,
    address,
    phone,
    referralCode,
    userID,
    role,
    profilePic,
    username,
    freelancer,
    freelancerId,
    freelancerProfile,
    freelancerProfileId,
    hasServiceProfile,
  };
};

export const mergeAuthUserProfile = (
  authUser: any,
  userData: Record<string, any>
) => {
  if (!authUser) return authUser;

  return {
    ...authUser,
    profile: normalizeUserProfile(userData, authUser.profile),
  };
};