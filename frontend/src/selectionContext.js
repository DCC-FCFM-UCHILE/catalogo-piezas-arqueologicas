import React, { createContext, useContext, useState,useEffect } from 'react';

/*
This js provide the way to handle de seleccion of many artifats for download. 
The components use selectedArtifacts. 
*/

const SelectionContext = createContext();

export const useSelection = () => {
  return useContext(SelectionContext);
};

export const SelectionProvider = ({ children }) => {

  const [selectedArtifacts, setSelectedArtifacts] = useState(()=>{
    const savedSelection = localStorage.getItem('selectedArtifacts');
    console.log(savedSelection)
    return savedSelection ? JSON.parse(savedSelection) : [];
  });

  const toggleSelection = (artifact) => {
    setSelectedArtifacts((prevSelected) => {

      // Verificar si el artefacto ya está en la lista de seleccionados por su ID
      const isSelected = prevSelected.some((item) => item.id === artifact.id);
      
      const newSelected = isSelected
        ? prevSelected.filter((item) => item.id !== artifact.id)  // Remover por ID
        : [...prevSelected, artifact];  // Agregar el objeto de artifact completo
      
      // Guardar la nueva selección en localStorage
      localStorage.setItem('selectedArtifacts', JSON.stringify(newSelected));
  
      return newSelected;
    });
  };
  const setEmptyList = () =>{
    setSelectedArtifacts([]);
    localStorage.removeItem('selectedArtifacts');
  }

  const removeById = (id) => {
    setSelectedArtifacts((prevSelected) => {
      const newSelected = prevSelected.filter((item) => item.id !== id);
      localStorage.setItem('selectedArtifacts', JSON.stringify(newSelected));
      console.log(selectedArtifacts);
      return newSelected;
    });
  };

  /*
  useEffect(() => {
    localStorage.setItem('selectedArtifacts', JSON.stringify(selectedArtifacts));
  }, [selectedArtifacts]);
  */
  useEffect(() => {
    console.log("selectedArtifacts ha cambiado:", selectedArtifacts);
  }, [selectedArtifacts]);

  return (
    <SelectionContext.Provider value={{ selectedArtifacts, toggleSelection,setEmptyList,removeById }}>
      {children}
    </SelectionContext.Provider>
  );
};