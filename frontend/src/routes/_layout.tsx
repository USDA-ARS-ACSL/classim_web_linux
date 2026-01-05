import { Flex, Spinner, Box } from "@chakra-ui/react"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import Sidebar from "../components/Common/Sidebar"
import UserMenu from "../components/Common/UserMenu"
import Header from "../components/Common/Header"
import Footer from "../components/Common/Footer"
import useAuth, { isLoggedIn } from "../hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  const { isLoading } = useAuth()

  return (
    <Flex direction="column" minH="100vh">
      <Header labName="ClassIM Research Lab" labLocation="Agricultural Research Service" />
      
      <Flex flex="1" maxW="large" h="auto" position="relative">
        <Sidebar />
        {isLoading ? (
          <Flex justify="center" key="spinnerKey" align="center" height="100vh" width="full">
            <Spinner size="xl" color="ui.main" />
          </Flex>
        ) : (
          <Outlet />
        )}
        <UserMenu />
      </Flex>
      
      <Footer />
    </Flex>
  )
}
