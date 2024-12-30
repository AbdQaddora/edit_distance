# DNA Edit Distance Calculator

This is a React application for calculating the edit distance between two DNA sequences. The edit distance measures the minimum number of operations (insertions, deletions, and substitutions) required to transform one sequence into another. The app provides various methods to calculate the distance, including bounded and adaptive bounded methods.

---

## Features

- Input DNA sequences of equal length.
- Choose between multiple calculation methods:
  - **Normal**: Full computation.
  - **Bounded**: Limited by a fixed boundary.
  - **Adaptive Bounded**: Dynamically adjusts the boundary.
  - **Sequence Alignment**: Alignment-based calculation.
- Customizable costs for insertions, deletions, and substitutions.
- Displays the dynamic programming table for visualization.
- Highlights the optimal transformation path.

---

## Live Demo

Check out the live version of the project here:  
**[DNA Edit Distance Calculator Live](https://edit-distance.netlify.app/)**

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AbdQaddora/edit_distance.git
   ```
2. Navigate to the project directory:
   ```bash
   cd edit_distance
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Usage

1. Enter two DNA sequences of equal length in the input fields.
2. Select the desired calculation method.
3. Customize the costs for insertions, deletions, and substitutions (optional).
4. Click **Calculate** to view the results, including:
   - Edit distance.
   - Dynamic programming table.
   - Optimal transformation path.

---

## Project Structure

```
src/
├── components/
│   └── DNAInput.js
├── constants/
│   └── index.js
├── utils/
│   ├── convertTableToAntdTable.js
│   ├── findTheOptimalPath.js
│   ├── initializeDpMatrix.js
│   ├── getBackTrackingText.js
│   └── prepareTableData.js
├── App.js
└── index.js
```

---

## Screenshots

### Input Screen
![image](https://github.com/user-attachments/assets/2ccd7961-ccb2-40c5-bcca-aeec8e22c871)


### Results Table
![image](https://github.com/user-attachments/assets/0945e8cd-1fa4-4733-af86-457dd157f756)

---

## Technologies Used

- **React**: Frontend framework.
- **Ant Design**: UI components and theming.
- **JavaScript**: Application logic and utilities.

---

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch-name`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature-branch-name`).
5. Open a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

If you have any questions or suggestions, feel free to reach out to:

- **GitHub**: [AbdQaddora](https://github.com/AbdQaddora)
