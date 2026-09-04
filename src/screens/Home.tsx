import { Text, View } from "react-native";
import { Button } from "@/components/ui/button";

export function Home() {
  return (
    <>
      <View>
        <Text>Home Page</Text>
        <Button
          className="text-black bg-blue-300"
          onPress={() => alert("Hola")}
        >
          Click me!
        </Button>
      </View>
    </>
  )
}