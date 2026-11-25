import ProfileScreen from "@/components/scholarmatch/screens/profile";

const accountErrors:Record<string,string>={
  invalid:"Enter valid account details.",
  name:"Name must be between 2 and 100 characters.",
  email:"Enter a valid email address.",
  "current-password":"Your current password is incorrect or missing.",
  password:"New password must be between 8 and 128 characters.",
  mismatch:"New passwords do not match.",
  exists:"That email is already in use.",
  session:"Your session expired. Sign in again.",
  service:"The account change could not be completed. Try again.",
};

export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=await searchParams;
  const code=Array.isArray(params.error)?params.error[0]:params.error;
  return <ProfileScreen initialAccountError={code?accountErrors[code]||"":""}/>;
}
