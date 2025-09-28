// remove next/image to avoid remote host config errors
import { CircleUser, MessageSquareMore, ChartPie, type LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: CircleUser,
    title: "Your Profile, Your Rules",
    description: "Customize your profile, set a banner, and decide who can see your activity.",
  },
  {
    icon: MessageSquareMore,
    title: "Connect With Friends",
    description: "Add friends, compare libraries, and see what they're reading in real time.",
  },
  {
    icon: ChartPie,
    title: "Reading Stats That Matter",
    description: "Dive into detailed charts that reveal your series preferences and hidden reading habits.",
  },
];

const CommunitySection = () => {
  return (
    <section id="social" className="border-y border-border bg-secondary py-16 sm:py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            More Than Just Tracking.
            <br className="hidden sm:block" />
            <span className="font-normal text-muted-foreground">Join the Community</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                  <feature.icon className="h-5 w-5 text-gray-700" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">{feature.title}</h4>
              </div>
              <p className="text-base text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="w-full">
          <img
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/55558765-b72b-44b4-bae4-2ea4bd5a8094-kenmei-co/assets/images/light-social-13.jpg?"
            alt="Light Social Features"
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-xl border border-border object-cover shadow-sm"
          />
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;