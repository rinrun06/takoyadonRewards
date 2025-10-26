import { useAuth } from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import { useState, useEffect } from "react";

interface Referral {
  id: string;
  referred_user_email: string;
  status: string;
}

const ReferralPage = () => {
  const { profile, remoteConfigValues } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (profile) {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', profile.id);

        if (error) {
          console.error("Error fetching referrals:", error);
        } else {
          setReferrals(data as Referral[]);
        }
      }
    };

    fetchReferrals();
  }, [profile]);

  if (!remoteConfigValues?.referral_feature_enabled) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Referral Program</h1>
        <p>The referral program is not currently available. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Refer a Friend</h1>
      <p>Your unique referral code is: <strong>{profile?.referral_code}</strong></p>

      <div className="mt-4">
        <h2 className="text-xl font-bold">Your Referrals</h2>
        {referrals.length > 0 ? (
          <ul>
            {referrals.map((referral) => (
              <li key={referral.id}>
                {referral.referred_user_email} - {referral.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven't referred anyone yet.</p>
        )}
      </div>
    </div>
  );
};

export default ReferralPage;
