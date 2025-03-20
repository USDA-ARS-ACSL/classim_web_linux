import { useState } from "react";
import { Box, Button, HStack, Icon, Text } from "@chakra-ui/react";
import { ChevronRightIcon, ChevronDownIcon } from "@chakra-ui/icons";

interface TreeMenuProps {
  level: number;
  title: string;
  parentTitle?: string;
  children?: React.ReactNode;
  onTitleClick: (title: string, level: number) => void;
  onButtonClick?: (parentTitle: string, level: number) => void;
}

const TreeMenu: React.FC<TreeMenuProps> = ({
  level,
  title,
  parentTitle,
  children,
  onTitleClick,
  onButtonClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box>
      <HStack>
        <Icon
          as={isOpen ? ChevronDownIcon : ChevronRightIcon}
          onClick={() => setIsOpen(!isOpen)}
          cursor="pointer"
        />
        <Text
          fontWeight={isOpen ? "bold" : "normal"}
          cursor="pointer"
          onClick={() => level !== 0 && onTitleClick(title, level)}
        >
          {title}
        </Text>
      </HStack>
      {isOpen && <Box pl={4}>{children}</Box>}
      {level > 0 && (
        <Button
          size="sm"
          ml={2}
          onClick={() => onButtonClick && onButtonClick(parentTitle ?? "", level)}
        >
          {level === 1
            ? "Add new experiment"
            : level === 2
            ? "Add new treatment"
            : "Add New Operation"}
        </Button>
      )}
    </Box>
  );
};

export default TreeMenu;
