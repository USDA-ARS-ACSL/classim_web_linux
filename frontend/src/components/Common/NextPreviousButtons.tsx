// NextPreviousButtons.js
import { Button, Flex } from "@chakra-ui/react";
import { useNavigate, useMatches } from "@tanstack/react-router";

const steps = [
  {name: 'Index', url:'/'},
  { name: 'Site', url: '/site' },
  { name: 'Soil', url: '/soil' },
  { name: 'Weather', url: '/weather' },
  { name: 'Cultivar', url: '/cultivar' },
  { name: 'Management', url: '/management' },
  { name: 'Seasonal Run', url: '/seasonal' },
  { name: 'Seasonal output', url: '/seasonalOutput' },
];

const NextPreviousButtons = () => {
  const navigate = useNavigate();
  const matches = useMatches();
  
  // Find the current route index based on matches and routeId
  const currentMatch = matches.find(match => match.routeId === matches[2]?.routeId);   
  const currentStepIndex = steps.findIndex(step => step.url === currentMatch?.pathname);  

  // Determine next and previous steps based on current index
  const prevStep = steps[currentStepIndex - 1];
  const nextStep = steps[currentStepIndex + 1];

  // Navigate to the next or previous step
  const goToPrevious = () => {
    if (prevStep) {
      navigate({ to: prevStep.url });
    }
  };

  const goToNext = () => {
    if (nextStep) {
      navigate({ to: nextStep.url });
    }
  };

  return (
    <Flex justifyContent="space-between" mt={4}>
      { currentStepIndex !== 0 && prevStep && 
        (<Button
          colorScheme="teal"
          onClick={goToPrevious}
          disabled={!prevStep}
        >
          Previous
        </Button>) 
      }
      
      { currentStepIndex !== steps.length - 1 && nextStep && 
        (<Button
          colorScheme="teal"
          onClick={goToNext}
          disabled={!nextStep}
        >
          Next
        </Button>) 
      }
    </Flex>
  );
};

export default NextPreviousButtons;
