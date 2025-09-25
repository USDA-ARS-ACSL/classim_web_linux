import { Box, Flex, Icon, Text, useColorModeValue } from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { FiInfo, FiUsers } from "react-icons/fi"
import { MdAssessment, MdDashboard, MdManageAccounts, MdQuestionAnswer, MdTimeline } from "react-icons/md"
import { FaMapMarkedAlt, FaUserGraduate } from "react-icons/fa"
import { GiGroundSprout, GiPlantSeed } from "react-icons/gi"
import { WiDayCloudy } from "react-icons/wi"

import type { UserPublic } from "../../client"

const items = [
  { icon: MdDashboard, title: "Dashboard", path: "/" },
  { icon: FaMapMarkedAlt, title: "Site", path: "/site" },
  { icon: GiGroundSprout, title: "Soil", path: "/soil" },
  { icon: WiDayCloudy, title: "Weather", path: "/weather" },
  { icon: GiPlantSeed, title: "Cultivar", path: "/cultivar" },
  { icon: MdManageAccounts, title: "Management", path: "/management" },
  { icon: MdTimeline, title: "Seasonal Run", path: "/seasonal" },
  { icon: MdAssessment, title: "Seasonal Output", path: "/seasonalOutput" },
  { icon: FiInfo, title: "About", path: "/about" },
  { icon: FaUserGraduate, title: "Expert System", path: "/expertsystem" },
  { icon: MdQuestionAnswer, title: "Update FAQs", path: "/faqmanager" }
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
