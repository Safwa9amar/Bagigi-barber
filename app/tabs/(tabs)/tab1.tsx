import EditScreenInfo from "@/components/EditScreenInfo";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";

export default function Tab2() {
  return (
    <Center className="flex-1">
      <Heading className="font-bold text-2xl">Expo - Tab 1</Heading>
      <Divider className="my-[30px] w-[80%]" />
      <Text className="p-4">Example below to use gluestack-ui components.</Text>
      <EditScreenInfo path="app/(app)/(tabs)/tab1.tsx" />
      <Box className="w-[300px] gap-4 p-3 rounded-md bg-background-100">
        <Skeleton variant="sharp" className="h-[100px]" />
        <SkeletonText _lines={3} className="h-2" />
        <HStack className="gap-1 align-middle">
          <Skeleton variant="circular" className="h-[24px] w-[28px] mr-2" />
          <SkeletonText _lines={2} gap={1} className="h-2 w-2/5" />
        </HStack>
      </Box>
    </Center>
  );
}
