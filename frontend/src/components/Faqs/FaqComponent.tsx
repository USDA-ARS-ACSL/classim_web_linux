import React from "react";
import {
  Box,
  Text,
  Flex,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { FaqService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface FaqComponentProps {
  tabname: string;
}

const FaqComponent: React.FC<FaqComponentProps> = ({ tabname }) => {
  const {
    data: faqs,
    isLoading: faqLoading,
    isError: faqError,
    error: faqErrorDetail,
  } = useQuery({
    queryKey: ["Site", tabname],
    queryFn: () => FaqService.readFaqs({ tabname }),
  });

  const showToast = useCustomToast();
  if (faqError) {
    const errDetail = (faqErrorDetail as any)?.body?.detail || "Unknown error";
    showToast("Something went wrong.", `${errDetail}`, "error");
  }

  return (
    <Box mt={12}>
      <Text fontSize='2xl'>FAQs</Text>
      {faqLoading ? (
        <Flex justify='center' align='center' height='100vh' width='full'>
          <Spinner size='xl' color='ui.main' />
        </Flex>
      ) : (
        faqs && (
          <Accordion defaultIndex={[0]} allowMultiple>
            {faqs.data.map((eachFaq) => (
              <AccordionItem key={eachFaq.id}>
                <h2>
                  <AccordionButton>
                    <Box flex='1' textAlign='left'>
                      {eachFaq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>{eachFaq.answer}</AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )
      )}
    </Box>
  );
};

export default FaqComponent;
