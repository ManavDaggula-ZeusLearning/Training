import pandas as pd
import matplotlib.pyplot as plt

# Create the data as a dictionary
data = {
    'label': ['Full'] * 6 + ['Minimal'] * 8,
    'x': [33161, 45923, 55601, 68276, 80899, 91035, 3593, 9521, 27742, 35796, 55864, 64747, 76329, 84248],
    'y': [36, 51, 64, 83, 96, 107, 4, 8, 24, 29, 56, 64, 67, 74]
}

# Create a DataFrame
df = pd.DataFrame(data)

# Create a line plot
plt.figure(figsize=(10, 6))

# Plotting each label separately
for label, group in df.groupby('label'):
    plt.plot(group['x'], group['y'], marker='o', label=label)

# Adding titles and labels
plt.title('Line Graph of X and Y by Label')
plt.xlabel('X')
plt.ylabel('Y')
plt.legend(title='Label')
plt.grid()

# Save the plot as an image
plt.savefig('line_graph.png', dpi=300, bbox_inches='tight')  # Save as PNG file

# Show the plot
plt.show()
