import { ChatGPTCodeDOM } from "./chatgpt-dom";
import { renderDiagram } from "./render-diagram";

export type PreparedCodeBlock = {
  //  The 'show diagram' button.
  showDiagramButton: HTMLButtonElement;
  showCodeButton: HTMLButtonElement;
  diagramTabContainer: HTMLDivElement;
};

export function prepareCodeBlock(
  document: Document,
  codeBlock: ChatGPTCodeDOM
): PreparedCodeBlock {
  //  Create the diagram tab container.
  const diagramTabContainer = document.createElement("div");
  diagramTabContainer.id = `chatgpt-diagram-container-${codeBlock.index}`;
  diagramTabContainer.classList.add("p-4", "overflow-y-auto");
  diagramTabContainer.style.backgroundColor = "#FFFFFF";
  codeBlock.codeContainerElement.after(diagramTabContainer);

  // //  Create the diagram 'after code' container.
  // const diagramContainer = document.createElement("div");
  // diagramContainer.id = `chatgpt-diagram-container-${codeBlock.index}`;
  // switch (displayMode) {
  //   case DisplayMode.BelowDiagram:
  //     //  Put the digram after the 'pre' element.
  //     codeBlock.preElement.after(diagramContainer);
  //     break;
  //   case DisplayMode.AsTabs:
  //     //  Set the style of the container to match the code block, then
  //     //  put into the code div.
  //     diagramContainer.classList.add("p-4", "overflow-y-auto");
  //     codeBlock.codeContainerElement.after(diagramContainer);
  //     //  Style the code block tab.
  //     codeBlock.codeContainerElement.style.display = "none";
  //     //  Style the diagram tab.
  //     diagramContainer.style.backgroundColor = "#FFFFFF";
  //     break;
  //   default:
  //     throw new Error(`Unknown diagram display mode '${displayMode}'`);

  //  Create the 'show diagram' button.
  const showDiagramButton = document.createElement("button");
  showDiagramButton.innerText = "Show diagram";
  showDiagramButton.classList.add("flex", "ml-auto", "gap-2");
  showDiagramButton.onclick = () => {
    renderDiagram(diagramTabContainer, `${codeBlock.index}`, codeBlock.code);
    codeBlock.codeContainerElement.style.display = "none";
    diagramTabContainer.style.display = "block";
    showDiagramButton.style.display = "none";
    showCodeButton.style.display = "inline-block";
  };
  codeBlock.copyCodeButton.before(showDiagramButton);

  //  Create the 'show code' button.
  const showCodeButton = document.createElement("button");
  showCodeButton.innerText = "Show code";
  showCodeButton.classList.add("flex", "ml-auto", "gap-2");
  showCodeButton.style.display = "none";
  showCodeButton.onclick = () => {
    codeBlock.codeContainerElement.style.display = "block";
    diagramTabContainer.style.display = "none";
    showDiagramButton.style.display = "inline-block";
    showCodeButton.style.display = "none";
  };
  codeBlock.copyCodeButton.before(showCodeButton);

  //  Add the 'chatgpt-diagrams' class to the code block - this means we will
  //  exclude it from later searches.
  codeBlock.preElement.classList.add("chatgpt-diagrams-processed");

  return {
    showDiagramButton,
    showCodeButton,
    diagramTabContainer,
  };
}
