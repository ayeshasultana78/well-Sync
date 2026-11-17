import React from 'react';
import {
  Info,
  AlertTriangle,
  Scale,
  BookOpen,
} from 'lucide-react';

export const AboutScreen: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Future Health Digital Innovation Challenge 2026
              </span>
              <span className="text-xs text-slate-500 font-medium">Abu Dhabi • Challenge 09</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">About WellSync</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              WellSync is a competition prototype engineered to sustain physical movement and sleep habits through adaptive,
              non-punitive goal calibration.
            </p>
          </div>
        </div>
      </div>

      {/* Team & Clinical Status Declaration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-600" />
          Team Status &amp; Scope Transparency
        </h2>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
          <p>
            <strong>Team:</strong> Built by two undergraduate students participating in the Future Health Digital Innovation
            Challenge 2026 (Abu Dhabi), Challenge 09: Sustaining Healthy Behaviors.
          </p>
          <p>
            <strong>Clinical Status:</strong> We have <strong>no clinical partner</strong>, have conducted <strong>no live clinical
            trials</strong>, and have conducted <strong>no human user testing</strong>.
          </p>
          <p>
            <strong>Zero Medical Claims:</strong> WellSync provides behavioral habit support only. It is <strong>not a medical device</strong>,
            does not provide clinical diagnoses, does not offer treatment plans, and infers zero medical conditions from recorded metrics.
          </p>
          <p>
            <strong>Rule-Based Architecture:</strong> The engine is entirely deterministic and rule-based. It does <strong>not use artificial
            intelligence or machine learning</strong> at runtime.
          </p>
        </div>
      </div>

      {/* Scientific Framework & Citations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          Behavioral Science &amp; Data Grounding
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm">Michie et al. (2013) BCTTv1</h3>
            <p className="text-slate-600 leading-relaxed">
              Every suggestion provided by the app is mapped directly to the published <em>Behavior Change Technique Taxonomy v1</em> (Annals
              of Behavioral Medicine):
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              <li><strong>BCT 8.7 Graded Tasks:</strong> 50% Minimum ladder rung upon lapse</li>
              <li><strong>BCT 1.4 Action Planning:</strong> Proactive micro-commitments</li>
              <li><strong>BCT 2.2 Feedback on Behaviour:</strong> Continuous recovery tracking</li>
              <li><strong>BCT 1.1 Goal Setting (Behaviour):</strong> Target rung alignment</li>
              <li><strong>BCT 1.5 Review Behaviour Goal(s):</strong> Optional +10% stretch rung</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm">LifeSnaps Dataset Attribution</h3>
            <p className="text-slate-600 leading-relaxed">
              Our offline replay evaluation uses the open-access <strong>LifeSnaps</strong> dataset (Sofia Yfantidou et al., <em>Nature
              Scientific Data</em>, 2022).
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              <li><strong>Zenodo Record:</strong> 7229547 (DOI: 10.5281/zenodo.6826682)</li>
              <li><strong>License:</strong> Creative Commons Attribution 4.0 International (CC BY 4.0)</li>
              <li><strong>Demographic Notice:</strong> The LifeSnaps cohort is <em>not an Abu Dhabi sample</em>. Replay results demonstrate algorithmic rule behavior, not proven human behavior change.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Out of Scope Features & Risk Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Deliberately Excluded Features &amp; Associated Risks
        </h2>
        <div className="text-xs text-slate-600 space-y-2">
          <p>
            The following capabilities are frequently included in commercial health applications but are <strong>strictly excluded</strong> from
            WellSync:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="text-slate-800 block mb-0.5">1. Employer / Insurer Views &amp; Data Exports</strong>
              <p className="text-[11px] text-slate-500">
                <em>Risk:</em> Creates workplace surveillance, coercive participation, and punitive employment or insurance consequences for missed days.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="text-slate-800 block mb-0.5">2. Public Leaderboards &amp; Peer Social Comparisons</strong>
              <p className="text-[11px] text-slate-500">
                <em>Risk:</em> Public rankings induce stigma and shame, exacerbating the "what-the-hell effect" and causing vulnerable users to abandon interventions.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="text-slate-800 block mb-0.5">3. AI Chatbots / Generative Diagnosis</strong>
              <p className="text-[11px] text-slate-500">
                <em>Risk:</em> Unconstrained generative models hallucinate health advice and create dangerous illusions of medical authority.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="text-slate-800 block mb-0.5">4. Reset-to-Zero Streak Counters</strong>
              <p className="text-[11px] text-slate-500">
                <em>Risk:</em> Erasing weeks of accumulated effort due to an unavoidable life disruption causes demoralization and disengagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
