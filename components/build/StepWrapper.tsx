'use client'

import { useRef } from 'react'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import {
  User, Briefcase, GraduationCap, AlignLeft,
  ArrowLeft, ArrowRight, Check, LayoutTemplate,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import SectionLine from '@/components/shared/SectionLine'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'

const STEPS = [
  { step: 1, label: 'Personal info',      sublabel: 'Name, title, contact',    icon: User          },
  { step: 2, label: 'Work experience',    sublabel: 'Jobs and achievements',    icon: Briefcase     },
  { step: 3, label: 'Education & skills', sublabel: 'Degrees, skills, extras', icon: GraduationCap },
  { step: 4, label: 'Summary',            sublabel: 'Professional overview',    icon: AlignLeft     },
]

const TOTAL_STEPS = STEPS.length

export type StepSubmitRef = { submit: () => void }

export default function StepWrapper() {
  const { currentStep, setStep } = useUIStore()
  const stepRef = useRef<StepSubmitRef>(null)

  const handleNext = () => stepRef.current?.submit()
  const handleBack = () => setStep(currentStep - 1)

  return (
    <div className="flex-1 flex overflow-hidden bg-muted/30">

      {/* ── Left — floating steps, no panel ─────────────────── */}
      <div className="hidden lg:flex w-64 xl:w-88 shrink-0 flex-col py-12 relative">

        {/* Section line */}
        <SectionLine className="left-8 top-12 bottom-12" />

        {/* Steps */}
        <div className="pl-22 pr-4 flex flex-col gap-18 mt-4">
          {STEPS.map(({ step, label, sublabel, icon: Icon }) => {
            const isComplete = currentStep > step
            const isActive   = currentStep === step
            const isPending  = currentStep < step

            return (
              <button
                key={step}
                type="button"
                disabled={!isComplete}
                onClick={() => isComplete && setStep(step)}
                className="flex items-center gap-3 text-left group disabled:cursor-default"
              >
                {/* Icon circle */}
                <div className={[
                  'w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                  isComplete && 'border-foreground bg-foreground text-background group-hover:opacity-75',
                  isActive   && 'border-foreground bg-background text-foreground shadow-sm',
                  isPending  && 'border-border bg-background/60 text-muted-foreground',
                ].filter(Boolean).join(' ')}>
                  {isComplete
                    ? <Check className="w-4 h-4" />
                    : <Icon  className="w-4 h-4" />
                  }
                </div>

                {/* Short connector */}
                <div className={[
                  'w-4 h-px shrink-0 transition-colors',
                  (isComplete || isActive) ? 'bg-foreground/25' : 'bg-border',
                ].join(' ')} />

                {/* Labels */}
                <div>
                  <p className={[
                    'text-sm font-semibold leading-tight',
                    isPending ? 'text-muted-foreground' : 'text-foreground',
                  ].join(' ')}>
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right — form + nav ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top strip */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
            {currentStep}/{TOTAL_STEPS}
          </span>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-foreground shrink-0">
            {STEPS[currentStep - 1].label}
          </span>
        </div>

        {/* Scrollable form — card fills the column */}
        <div className="flex-1 overflow-auto px-4 lg:px-8 xl:px-12 pt-8 pb-4">
          <h2 className="text-xl font-semibold mb-4 mt-8 px-1">
            {STEPS[currentStep - 1].label}
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="bg-background rounded-2xl border shadow-sm p-6 lg:p-10"
            >
              {currentStep === 1 && <Step1 ref={stepRef} />}
              {currentStep === 2 && <Step2 ref={stepRef} />}
              {currentStep === 3 && <Step3 ref={stepRef} />}
              {currentStep === 4 && <Step4 ref={stepRef} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation — outside the card, Back left · Next right */}
        <div className="px-4 lg:px-8 xl:px-12 py-5 flex justify-between items-center shrink-0">
          {currentStep > 1 ? (
            <Button variant="outline" size="lg" onClick={handleBack} className="rounded-full">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <div />
          )}
          <Button size="lg" onClick={handleNext} className="rounded-full">
            {currentStep === TOTAL_STEPS ? (
              <><LayoutTemplate className="w-4 h-4" /> Browse templates</>
            ) : (
              <>Next <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </div>

      </div>
    </div>
  )
}
