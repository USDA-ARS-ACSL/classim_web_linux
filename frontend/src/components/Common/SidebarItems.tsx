import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { FiBriefcase, FiHome, FiSettings, FiUsers } from "react-icons/fi"

import type { UserPublic } from "../../client"

const items = [
  { icon: FiHome, title: "Dashboard", path: "/" },
  { icon: FiHome, title: "Site", path: "/site" },
  { icon: FiHome, title: "Soil", path: "/soil" },
  { icon: FiBriefcase, title: "Weather", path: "/weather" },
  { icon: FiSettings, title: "Cultivar", path: "/cultivar" },
  { icon: FiHome, title: "Management", path: "/management" },
  { icon: FiHome, title: "Seasonal Run", path: "/seasonal" },
  // { icon: FiBriefcase, title: "Rotation Builder", path: "/rotationBuilder" },
  { icon: FiSettings, title: "Seasonal Output", path: "/seasonalOutput" },
  // { icon: FiSettings, title: "Rotation Output", path: "/rotationBuilderOutput" },
  { icon: FiSettings, title: "About", path: "/about" },
  { icon: FiSettings, title: "Expert System", path: "/expertsystem" }, // Added Expert System
  { icon: FiSettings, title: "Update FAQs", path: "/faqmanager" } // Added Expert System
]

interface SidebarItemsProps {
  onClose?: () => void
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const textColor = useColorModeValue("ui.main", "ui.light")
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568")
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])

  const finalItems = currentUser?.is_superuser
    ? [...items, { icon: FiUsers, title: "Admin", path: "/admin" }]
    : items

  const listItems = finalItems.map(({ icon, title, path }) => (
    <Flex
      as={Link}
      to={path}
      w="100%"
      p={2}
      key={title}
      activeProps={{
        style: {
          background: bgActive,
          borderRadius: "12px",
        },
      }}
      color={textColor}
      onClick={onClose}
    >
      <Icon as={icon} alignSelf="center" />
      <Text ml={2}>{title}</Text>
    </Flex>
  ))

  return (
    <>
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
