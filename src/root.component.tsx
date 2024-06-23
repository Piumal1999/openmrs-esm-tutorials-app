import { Button } from '@carbon/react';
import { navigate } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Joyride, { EVENTS, type CallBackProps } from 'react-joyride';

const Root: React.FC = () => {
  const { t } = useTranslation();
  const [tutorialState, setTutorialState] = React.useState({ run: false, stepIndex: 0 });
  const steps = [
    {
      target: '[data-extension-id="add-patient-action"]',
      content: 'Click here to add a patient',
      disableBeacon: true,
      styles: {
        options: {
          zIndex: 10000,
        },
      },
      disableOverlayClose: true,
      spotlightClicks: true,
      hideCloseButton: true,
      hideFooter: true,
      title: 'Create a patient!',
      data: {
        next: 'patient-registration',
        clickRequired: true,
      },
    },
    {
      target: '#demographics',
      content: 'Fill the details and click on save',
      disableBeacon: true,
      hideBackButton: true,
      disableOverlayClose: true,
    },
    {
      target: '.cds--btn--tertiary',
      content: 'Click here if you want to cancel',
      disableBeacon: true,
      hideBackButton: true,
      locale: { last: 'Ok' },
      disableOverlayClose: true,
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, type, step } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      handleStepChange(index + 1);
    } else if (type === EVENTS.TOUR_END) {
      setTutorialState({ run: false, stepIndex: 0 });
    }
  };

  const handleStepChange = (nextStepIndex: number) => {
    if (nextStepIndex < steps.length) {
      const currentStep = steps[nextStepIndex - 1];
      const nextStep = steps[nextStepIndex];

      if (currentStep.data?.next) {
        const basePath = window.getOpenmrsSpaBase();
        const nextPath = `${basePath}${currentStep.data.next}`;

        if (window.location.pathname !== nextPath.replace(basePath, '')) {
          navigate({ to: nextPath });
        }
      }

      setTimeout(() => {
        const targetElement = document.querySelector(nextStep.target);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          setTutorialState({ run: true, stepIndex: nextStepIndex });
        } else {
          console.warn(`Target element not found: ${nextStep.target}`);
          handleStepChange(nextStepIndex + 1);
        }
      }, 100);
    } else {
      setTutorialState({ run: false, stepIndex: 0 });
    }
  };

  useEffect(() => {
    const handleTargetClick = (event: MouseEvent) => {
      if (tutorialState.run && steps[tutorialState.stepIndex].data?.clickRequired) {
        const currentStep = steps[tutorialState.stepIndex];
        const targetElement = document.querySelector(currentStep.target);
        if (targetElement && targetElement.contains(event.target as Node)) {
          handleStepChange(tutorialState.stepIndex + 1);
        }
      }
    };

    document.addEventListener('click', handleTargetClick);

    return () => {
      document.removeEventListener('click', handleTargetClick);
    };
  });

  return (
    <div style={{ zIndex: 9100 }}>
      <Joyride
        callback={handleJoyrideCallback}
        steps={steps}
        stepIndex={tutorialState.stepIndex}
        run={tutorialState.run}
        continuous={true}
        showProgress={false}
        showSkipButton={true}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      <div
        style={{
          position: 'fixed',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bottom: 50,
          right: 50,
        }}
      >
        <Button kind="ghost" onClick={() => setTutorialState({ run: true, stepIndex: 0 })}>
          Start Tutorial
        </Button>
      </div>
    </div>
  );
};

export default Root;
