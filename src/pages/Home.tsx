import Layout from '@/Components/Layout';
import { Link } from 'react-router-dom';
import { Star, Gift, Zap } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';

const FeatureCard = ({ icon: Icon, title, children }: { icon: ElementType, title: string, children: ReactNode }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg text-center transform hover:scale-105 transition-transform duration-300 border-2 border-red-100">
        <div className="inline-block bg-gradient-to-br from-red-500 to-orange-500 p-4 rounded-full mb-4">
            <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
        <p className="text-gray-600">{children}</p>
    </div>
);

export default function Home() {
    return (
        <Layout>
            <div className="bg-red-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-4">
                        Welcome to the <span className="text-red-600">Takoyadon</span> Loyalty Program
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
                        Earn points for every purchase, get exclusive rewards, and enjoy special perks. Joining is free and easy!
                    </p>
                    <Link 
                        to="/customer/signup" 
                        className="inline-block bg-red-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-red-700 transition-transform transform hover:scale-110 shadow-lg"
                    >
                        Join Now & Get 50 Bonus Points
                    </Link>
                </div>
            </div>

            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-extrabold text-black">How It Works</h2>
                        <p className="text-lg text-gray-600 mt-2">Three simple steps to delicious rewards.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard icon={Zap} title="Sign Up">
                            Create your free account in seconds and instantly receive bonus points just for joining.
                        </FeatureCard>
                        <FeatureCard icon={Star} title="Earn Points">
                            Get points for every purchase, sharing on social media, leaving feedback, and more.
                        </FeatureCard>
                        <FeatureCard icon={Gift} title="Redeem Rewards">
                            Use your points to claim free food, exclusive merchandise, and special discounts.
                        </FeatureCard>
                    </div>
                </div>
            </div>

             <div className="bg-gray-50 py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-extrabold text-black mb-4">Ready to Join?</h2>
                    <p className="text-lg text-gray-600 mb-8">Start your journey to delicious rewards and become a Takoyadon VIP today!</p>
                    <Link 
                        to="/customer/signup" 
                        className="inline-block bg-red-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-red-700 transition-transform transform hover:scale-110 shadow-lg"
                    >
                        Sign Up Now
                    </Link>
                </div>
            </div>
        </Layout>
    );
}