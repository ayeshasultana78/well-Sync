import React from 'react';
import {
  Info,
  AlertTriangle,
  Scale,
  BookOpen,
} from 'lucide-react';
import { Language, t } from '../i18n/translations';

interface AboutScreenProps {
  language: Language;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ language }) => {
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
                {t('about.challenge_badge', language)}
              </span>
              <span className="text-xs text-slate-500 font-medium">{t('about.challenge_title', language)}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t('about.title', language)}</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {language === 'ar'
                ? 'WellSync هو نموذج أولي للمنافسة تم تصميمه للحفاظ على النشاط البدني وروتين النوم من خلال معايرة أهداف تكيفية وغير عقابية.'
                : 'WellSync is a competition prototype engineered to sustain physical movement and sleep habits through adaptive, non-punitive goal calibration.'}
            </p>
          </div>
        </div>
      </div>

      {/* Team & Clinical Status Declaration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-600" />
          {language === 'ar' ? 'إقرار النموذج الأولي للطلاب: شفافية الفريق ونطاق العمل' : 'Student Prototype Declaration: Team Status & Scope Transparency'}
        </h2>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
          <p>
            <strong>{language === 'ar' ? 'فريق العمل:' : 'Student Authors:'}</strong>{' '}
            1. Ayesha Sultana, 2. B. Alence ({language === 'ar' ? 'طالبان جامعيان' : 'Undergraduate Students'})
          </p>
          <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-xs font-semibold">
            {language === 'ar' ? (
              <span>
                تنويه: نموذج أولي للطلاب، وليس له أي صلة بأي منتج تجاري يحمل اسم WellSync (
                <a href="https://dev-wp.wellsync.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-950">
                  wellsync
                </a>
                ).
              </span>
            ) : (
              <span>
                Notice: Student prototype, not affiliated with any commercial product named WellSync (
                <a href="https://dev-wp.wellsync.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-950">
                  wellsync
                </a>
                ).
              </span>
            )}
          </div>
          <p>
            <strong>{language === 'ar' ? 'الوضع السريري:' : 'Clinical Status:'}</strong>{' '}
            {language === 'ar'
              ? 'ليس لدينا شريك سريري، ولم نجرِ أي تجارب سريرية حية، ولم نجرِ أي اختبارات على مستخدمين بشريين.'
              : 'We have no clinical partner, have conducted no live clinical trials, and have conducted no human user testing.'}
          </p>
          <p>
            <strong>{language === 'ar' ? 'إخلاء المسؤولية الطبية:' : 'Zero Medical Claims:'}</strong>{' '}
            {language === 'ar'
              ? 'يقدم WellSync دعماً سلوكياً فقط. وهو ليس جهازاً طبياً، ولا يقدم تشخيصات سريرية، ولا يقترح خطط علاج، ولا يستنتج أي حالات طبية من المؤشرات المسجلة.'
              : 'WellSync provides behavioral habit support only. It is not a medical device, does not provide clinical diagnoses, does not offer treatment plans, and infers zero medical conditions from recorded metrics.'}
          </p>
          <p>
            <strong>{language === 'ar' ? 'بنية قائمة على القواعد 100%:' : 'Rule-Based Architecture:'}</strong>{' '}
            {t('about.rules_desc', language)}
          </p>
        </div>
      </div>

      {/* Scientific Framework & Citations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          {language === 'ar' ? 'العلوم السلوكية ومصادر البيانات' : 'Behavioral Science & Data Grounding'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm">Michie et al. (2013) BCTTv1</h3>
            <p className="text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'كل اقتراح وتوجيه يقدمه التطبيق يرتبط مباشرة بتصنيف تقنيات تغيير السلوك المنشور:'
                : 'Every suggestion provided by the app is mapped directly to the published Behavior Change Technique Taxonomy v1:'}
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              <li><strong>BCT 8.7 Graded Tasks:</strong> {language === 'ar' ? 'المستوى الأدنى 50% عند التراجع' : '50% Minimum ladder rung upon lapse'}</li>
              <li><strong>BCT 1.4 Action Planning:</strong> {language === 'ar' ? 'التزامات مصغرة استباقية' : 'Proactive micro-commitments'}</li>
              <li><strong>BCT 2.2 Feedback on Behaviour:</strong> {language === 'ar' ? 'متابعة مسار التعافي المستمر' : 'Continuous recovery tracking'}</li>
              <li><strong>BCT 1.1 Goal Setting:</strong> {language === 'ar' ? 'مواءمة المستوى المستهدف' : 'Target rung alignment'}</li>
              <li><strong>BCT 1.5 Review Behaviour Goal(s):</strong> {language === 'ar' ? 'المستوى الموسع الاختياري +10%' : 'Optional +10% stretch rung'}</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm">{t('about.lifesnaps_title', language)}</h3>
            <p className="text-slate-600 leading-relaxed">
              {language === 'ar'
                ? 'تعتمد إعادة المحاكاة على بيانات دراسة LifeSnaps المنشورة في مجلة Scientific Data:'
                : 'Our offline replay evaluation uses the published LifeSnaps dataset from Nature Scientific Data:'}
            </p>
            <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <p className="font-medium text-slate-900">
                Sofia Yfantidou, Christina Karagianni, Stefanos Efstathiou, Athena Vakali, Joao Palotti, Dimitrios Panteleimon Giakatos, Thomas Marchioro, Andrei Kazlouski, Elena Ferrari, and Šarūnas Girdzijauskas.
              </p>
              <p className="italic text-slate-600">
                "LifeSnaps, a 4-month multi-modal dataset capturing unobtrusive snapshots of our lives in the wild."
              </p>
              <p className="text-slate-500 font-mono text-[10px]">
                Scientific Data 9, 663 (2022). DOI: 10.1038/s41597-022-01764-x | PMCID: PMC9622868
              </p>
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5 pt-1">
              <li><strong>Zenodo Repository:</strong> Record 7229547 (DOI: 10.5281/zenodo.7229547)</li>
              <li><strong>License:</strong> Creative Commons Attribution 4.0 International (CC BY 4.0)</li>
              <li><strong>Demographic Scope:</strong> {t('evidence.disclaimer_2', language)}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Out of Scope Features & Risk Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          {t('about.excluded_title', language)}
        </h2>
        <div className="text-xs text-slate-600 space-y-2">
          <p>
            {t('about.excluded_desc', language)}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="text-slate-800 block mb-0.5">
                {language === 'ar' ? '1. تقارير ومشاركات أرباب العمل والتأمين' : '1. Employer / Insurer Views & Data Exports'}
              </strong>
              <p className="text-[11px] text-slate-500">
                <em>{language === 'ar' ? 'المخاطر:' : 'Risk:'}</em>{' '}
                {language === 'ar'
                  ? 'تخلق بيئة مراقبة في مكان العمل وتجبر المستخدمين على المشاركة وتفرض عقوبات وظيفية أو تأمينية على الأيام غير المكتملة.'
                  : 'Creates workplace surveillance, coercive participation, and punitive employment or insurance consequences for missed days.'}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="text-slate-800 block mb-0.5">
                {language === 'ar' ? '2. لوحات المتصدرين والمقارنات الاجتماعية' : '2. Public Leaderboards & Peer Social Comparisons'}
              </strong>
              <p className="text-[11px] text-slate-500">
                <em>{language === 'ar' ? 'المخاطر:' : 'Risk:'}</em>{' '}
                {language === 'ar'
                  ? 'تسبب التصنيفات العلنية الوصم والشعور بالذنب، مما يعزز أثر الإحباط والتخلي عن العادة تماماً لدى المستخدمين المتعثرين.'
                  : 'Public rankings induce stigma and shame, exacerbating the "what-the-hell effect" and causing vulnerable users to abandon interventions.'}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="text-slate-800 block mb-0.5">
                {language === 'ar' ? '3. روبوتات الدردشة التوليدية والتشخيص الآلي' : '3. AI Chatbots / Generative Diagnosis'}
              </strong>
              <p className="text-[11px] text-slate-500">
                <em>{language === 'ar' ? 'المخاطر:' : 'Risk:'}</em>{' '}
                {language === 'ar'
                  ? 'النماذج التوليدية تهلوس بالنصائح الطبية وتوهم المستخدم بسلطة سريرية وهمية لا أساس لها.'
                  : 'Unconstrained generative models hallucinate health advice and create dangerous illusions of medical authority.'}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <strong className="text-slate-800 block mb-0.5">
                {language === 'ar' ? '4. عدادات التتابع التي تعود إلى الصفر' : '4. Reset-to-Zero Streak Counters'}
              </strong>
              <p className="text-[11px] text-slate-500">
                <em>{language === 'ar' ? 'المخاطر:' : 'Risk:'}</em>{' '}
                {language === 'ar'
                  ? 'محو أسابيع من الجهد المتراكم بسبب ظرف قهري مؤقت يسبب الإحباط والانسحاب من البرنامج.'
                  : 'Erasing weeks of accumulated effort due to an unavoidable life disruption causes demoralization and disengagement.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
