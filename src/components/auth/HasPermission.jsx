import { useAuth } from "../../context/AuthContext";

const HasPermission = ({ slug, roles, children }) => {
  const { hasPermission, role } = useAuth();

  const hasPerm = slug ? hasPermission(slug) : false;
  const hasRole = roles ? roles.includes(role) : false;

  if (hasPerm || hasRole) {
    return children;
  }

  return null;
};

export default HasPermission;