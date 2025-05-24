import React, { createContext, useContext, useState } from 'react';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    const savedRole = sessionStorage.getItem('role');
    console.log('Initialized role from sessionStorage:', savedRole); 
    return savedRole || '';
  });

  const updateRole = (newRole) => {
    console.log('Setting role to:', newRole);
    setRole(newRole);
    sessionStorage.setItem('role', newRole);
  };

  return (
    <RoleContext.Provider value={{ role, setRole: updateRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
