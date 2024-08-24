import { Container } from "@mui/material";
import { Header } from "@/app/components/header/Header";
import { ContentWrapper } from "./ContentWrapper";

export default function Home() {
  return (
    <Container>
      <Header />
      <ContentWrapper />
    </Container>
  );
}
