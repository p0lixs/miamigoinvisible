import { router } from "expo-router";
import { Shell } from "../components/Shell";
import { Body, Button, Heading } from "../components/ui";
export default function NotFound() {
  return (
    <Shell>
      <Heading>Esta sorpresa no está aquí</Heading>
      <Body muted>No hemos encontrado la página que buscas.</Body>
      <Button onPress={() => router.replace("/")}>Volver a mis sorteos</Button>
    </Shell>
  );
}
