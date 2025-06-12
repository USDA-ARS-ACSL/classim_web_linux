import React, { useEffect, useState } from "react";
import {
  Container,
  Heading,
  Select,
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Input,
  Textarea,
  Button,
  Tooltip,
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { createFileRoute } from "@tanstack/react-router";
import { FAQService } from "../../client";

interface FAQOut {
  id: number;
  tabname: string;
  question?: string | null;
  answer?: string | null;
  owner_id?: number | null;
}

const TAB_NAMES = [
  "general",
  "Cultivar_soybean",
  "Site",
  "weather",
  "seasonal",
  "soil",
  "Cultivar_potato",
  "Cultivar_maize",
  "welcome",
  "Cultivar_cotton",
  "rotation",
  "management",
];

interface FAQForm {
  tabname: string;
  question: string;
  answer: string;
}

// Type guard to check if object has a .data property that is an array
function hasArrayData(obj: any): obj is { data: unknown[] } {
  return obj && Array.isArray(obj.data);
}

const FAQManager = () => {
  const [allFaqs, setAllFaqs] = useState<FAQOut[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("");
  const [filteredFaqs, setFilteredFaqs] = useState<FAQOut[]>([]);
  const [form, setForm] = useState<FAQForm>({
    tabname: "",
    question: "",
    answer: "",
  });
  const [editId, setEditId] = useState<number | null>(null);

  // Load all FAQs once on mount
  useEffect(() => {
    FAQService.getAllFAQs()
      .then((response: any) => {
        if (Array.isArray(response)) {
          setAllFaqs(response as FAQOut[]);
        } else if (hasArrayData(response)) {
          setAllFaqs((response as { data: FAQOut[] }).data);
        } else {
          setAllFaqs([]);
        }
      })
      .catch((e) => {
        console.error("Failed to fetch FAQs:", e);
      });
  }, []);

  // When selectedTab or allFaqs change, filter FAQs and reset form
  useEffect(() => {
    const faqsArray = Array.isArray(allFaqs) ? allFaqs : [];
    if (selectedTab) {
      setFilteredFaqs(faqsArray.filter((f) => f.tabname === selectedTab));
      setForm({ tabname: selectedTab, question: "", answer: "" });
      setEditId(null);
    } else {
      setFilteredFaqs([]);
      setForm({ tabname: "", question: "", answer: "" });
      setEditId(null);
    }
  }, [selectedTab, allFaqs]);

  const handleTabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTab(e.target.value);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const handleEditClick = (faq: FAQOut) => {
    setForm({
      tabname: faq.tabname,
      question: faq.question ?? "",
      answer: faq.answer ?? "",
    });
    setEditId(faq.id);
  };

  const handleSubmit = async () => {
    if (!form.tabname.trim()) {
      alert("Please select a Tab Name");
      return;
    }
    try {
      if (editId) {
        await FAQService.updateFAQ(editId, form);
      } else {
        await FAQService.createFAQ(form);
      }
      // Refresh FAQs after change
      const updatedFaqs: any = await FAQService.getAllFAQs();
      if (Array.isArray(updatedFaqs)) {
        setAllFaqs(updatedFaqs as FAQOut[]);
      } else if (hasArrayData(updatedFaqs)) {
        setAllFaqs((updatedFaqs as { data: FAQOut[] }).data);
      } else {
        setAllFaqs([]);
      }
      setSelectedTab(form.tabname); // refresh filtered FAQs based on this tab
      setForm({ tabname: form.tabname, question: "", answer: "" });
      setEditId(null);
    } catch (error) {
      alert("Failed to save FAQ");
      console.error(error);
    }
  };

  return (
    <Container maxW="full" mt={[4, 5]} width={"80%"}>
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pb={4}>
        FAQ Management
      </Heading>

      {/* Tab selection dropdown */}
      <Select
        placeholder="Select Tab"
        value={selectedTab}
        onChange={handleTabChange}
        mb={6}
      >
        {TAB_NAMES.map((tab) => (
          <option key={tab} value={tab}>
            {tab}
          </option>
        ))}
      </Select>

      {/* Show list of FAQs for the selected tab */}
      <VStack spacing={4} align="stretch" mb={6}>
        {filteredFaqs.length === 0 && selectedTab && (
          <Text>No FAQs for this tab yet.</Text>
        )}
        {filteredFaqs.map((faq) => (
          <Box
            key={faq.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            _hover={{ bg: "gray.50" }}
          >
            <HStack justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Text fontWeight="bold">{faq.question}</Text>
                <Text mt={1}>{faq.answer}</Text>
              </Box>
              <Tooltip label="Edit FAQ" aria-label="Edit FAQ tooltip">
                <IconButton
                  aria-label="Edit FAQ"
                  icon={<FiEdit />}
                  size="sm"
                  onClick={() => handleEditClick(faq)}
                />
              </Tooltip>
            </HStack>
          </Box>
        ))}
      </VStack>

      {/* FAQ create / edit form */}
      {selectedTab && (
        <Box p={4} borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={4}>
            {editId ? "Edit FAQ" : "Create New FAQ"} (Tab: {selectedTab})
          </Heading>

          <VStack spacing={4} align="start">
            {/* tabname is fixed from selected tab */}

            <Input
              name="question"
              placeholder="Question"
              value={form.question}
              onChange={handleChange}
            />
            <Textarea
              name="answer"
              placeholder="Answer"
              value={form.answer}
              onChange={handleChange}
              rows={4}
            />

            <HStack spacing={4}>
              <Button colorScheme="blue" onClick={handleSubmit}>
                {editId ? "Update FAQ" : "Create FAQ"}
              </Button>
              {editId && (
                <Button
                  onClick={() => {
                    setEditId(null);
                    setForm({ tabname: selectedTab, question: "", answer: "" });
                  }}
                >
                  Cancel
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>
      )}
    </Container>
  );
};

export const Route = createFileRoute("/_layout/FAQManager")({
  component: FAQManager,
});

export default FAQManager;
