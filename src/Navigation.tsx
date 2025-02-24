import { Container, Navbar, Image, Nav, NavDropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "./UserContext"; // Ensure you import useUser

export default function Navigation() {
  const { isLoggedIn, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logout function from context
    navigate("/"); // Redirect to login page
  };

  return (
    isLoggedIn && ( // Only show the navbar when the user is logged in
      <Container fluid className="mx-0 px-0">
        <Navbar expand="xxl" className="bg-custom-color4" sticky="top">
          <Container>
            <Navbar.Brand href="#home" className="me-5 mt-2">
              <Image src="./BudgetBuddyLogo 1.png" style={{ width: "120px" }} />
            </Navbar.Brand>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              className="custom-font-color1 custom-bg-color1"
            />
            <Navbar.Collapse id="basic-navbar-nav" className="custom-font-color1">
              <Nav className="me-auto mt-5 d-flex gap-4">
                <Nav.Link as={NavLink} to="/dashboard" className="nav-item-custom">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={NavLink} to="/expense" className="nav-item-custom">
                  Expense
                </Nav.Link>
                <Nav.Link as={NavLink} to="/income" className="nav-item-custom">
                  Income
                </Nav.Link>
                <Nav.Link as={NavLink} to="/goal" className="nav-item-custom">
                  Goal
                </Nav.Link>
              </Nav>

              <NavDropdown
                className="custom-dropdown custom-font-color1 mt-5 ms-2"
                title={
                  <FontAwesomeIcon
                    icon={faUser}
                    style={{ height: "28px" }}
                    className="custom-font-color1"
                  />
                }
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={NavLink} to="/profile" className="fs-6 custom-font-family">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/change-password" className="fs-6 custom-font-family">
                  Change Password
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout} className="fs-6 custom-font-family">
                  Log Out
                </NavDropdown.Item>
              </NavDropdown>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </Container>
    )
  );
}
