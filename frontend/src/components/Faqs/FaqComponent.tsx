import React from "react";
import {
  Flex,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { FiHelpCircle } from "react-icons/fi";
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

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Tooltip label="Show FAQs" placement="left">
        <IconButton
          icon={<FiHelpCircle />}
          aria-label="Show FAQs"
          colorScheme="teal"
          size="lg"
          position="fixed"
          top="50%"
          right={0}
          transform="translateY(-50%)"
          borderRadius="full"
          boxShadow="lg"
          zIndex={1000}
          onClick={onOpen}
        />
      </Tooltip>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>FAQs</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {faqLoading ? (
              <Flex justify="center" align="center" height="30vh" width="full">
                <Spinner size="xl" color="ui.main" />
              </Flex>
            ) : faqs ? (
              <Accordion defaultIndex={[0]} allowMultiple>
                {faqs.data.map((eachFaq: any) => (
                  <AccordionItem key={eachFaq.id}>
                    <h2>
                      <AccordionButton>
                        <span style={{ flex: 1, textAlign: "left" }}>
                          {eachFaq.question}
                        </span>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>{eachFaq.answer}</AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <span>No FAQs found.</span>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FaqComponent;
