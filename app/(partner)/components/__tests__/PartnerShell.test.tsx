import { render, screen, fireEvent, within } from "@testing-library/react";
import PartnerShell from "../PartnerShell";

// Mock next/navigation's useRouter used inside PartnerShell
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("PartnerShell", () => {
  test("muestra items y permite colapsar", () => {
    render(
      <PartnerShell>
        <div>content</div>
      </PartnerShell>
    );

    // Item visible
    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    // Colapsar
    const toggle = screen.getByLabelText("Toggle sidebar");
    fireEvent.click(toggle);

    // Después de colapsar, label no debe estar visible
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  test("abre el menú móvil cuando se hace click en el botón de menú", () => {
    render(
      <PartnerShell>
        <div>content</div>
      </PartnerShell>
    );

    const open = screen.getByLabelText("Open menu");
    fireEvent.click(open);

    // El drawer móvil contiene el título "Panel"
    const mobile = screen.getByLabelText("Mobile menu");
    expect(within(mobile).getByText("Panel")).toBeInTheDocument();
  });
});