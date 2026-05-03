    summaryMethod({ columns }) {
      const sums = [];
      columns.forEach((col, index) => {
        if (index === 0) {
          // 修改：将 "合计" 改为 "描述"
          sums[index] = "描述";
          return;
        }
        const prop = col.property;
        if (!prop || !prop.startsWith("a_")) {
          sums[index] = "";
          return;
        }
        const abilityId = Number(prop.slice(2));
        let total = 0;
        this.courses.forEach((row) => {
          total += this.numericCell(row.id, abilityId);
        });
        sums[index] = total.toFixed(2);
      });
      return sums;
    },