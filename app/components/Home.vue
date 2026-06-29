<template>
  <Page class="page">
    <ActionBar title="KG Weight Tracker" class="action-bar" />

    <GridLayout rows="auto, *" columns="*">

      <!-- INPUT CONTAINER -->
      <StackLayout row="0" class="input-container" p="15">
        <Label :text="isEditing ? 'Modify Selected Log' : 'Record Today\'s Weight'" class="section-title" />

        <GridLayout columns="*, auto" rows="auto" class="form-row">
          <TextField
            col="0"
            v-model="weightInput"
            hint="Enter weight in KG"
            keyboardType="number"
            class="input-field"
          />
          <Button
            col="1"
            :text="isEditing ? 'Save Edit' : 'Add Entry'"
            @tap="handleSave"
            class="btn-save"
          />
        </GridLayout>

        <Button
          v-if="isEditing"
          text="Cancel Changes"
          @tap="cancelEdit"
          class="btn-cancel"
        />
      </StackLayout>

      <!-- HISTORICAL LIST COMPONENT -->
      <ListView row="1" :items="records" class="list-group">
        <v-template let-item="item">
          <GridLayout columns="*, auto, auto" class="list-item" p="12">

            <StackLayout col="0">
              <Label :text="item.WEIGHT + ' kg'" class="weight-label" />
              <Label :text="formatDate(item.CREATED_AT)" class="date-label" />
            </StackLayout>

            <Button
              col="1"
              text="✏️ Edit"
              @tap="startEdit(item)"
              class="btn-edit"
            />

            <Button
              col="2"
              text="❌ Delete"
              @tap="confirmDelete(item.id)"
              class="btn-delete"
            />

          </GridLayout>
        </v-template>
      </ListView>

    </GridLayout>
  </Page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Dialogs } from '@nativescript/core';
import Sqlite from 'nativescript-sqlite';

// UI Form State Reactivity Controls
const records = ref([]);
const weightInput = ref('');
const isEditing = ref(false);
const editingRecordId = ref(null);
let dbInstance = null;

// ==========================================
// SQLITE CORES AND DATABASE CONTROLLER INTERFACE
// ==========================================
async function initDb() {
  if (dbInstance) return;
  try {
    dbInstance = await new Sqlite('weight_tracker.db');
    await dbInstance.execSQL(
      `CREATE TABLE IF NOT EXISTS weight_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        CREATED_AT TEXT NOT NULL,
        WEIGHT REAL NOT NULL
      )`
    );
  } catch (error) {
    console.error('Database connection breakdown:', error);
  }
}

async function loadRecords() {
  try {
    await initDb();
    const rows = await dbInstance.all('SELECT id, CREATED_AT, WEIGHT FROM weight_records ORDER BY CREATED_AT DESC', []);
    records.value = rows.map(row => ({
      id: row[0],
      CREATED_AT: row[1],
      WEIGHT: row[2]
    }));
  } catch (error) {
    console.error('Failed querying active database rows:', error);
  }
}

// ==========================================
// INTERACTIVE RUNTIME LOGIC ACTIONS
// ==========================================
async function handleSave() {
  const numericWeight = parseFloat(weightInput.value);

  if (isNaN(numericWeight) || numericWeight <= 0) {
    Dialogs.alert('Please input a valid numeric weight measurement.');
    return;
  }

  try {
    await initDb();
    if (isEditing.value && editingRecordId.value !== null) {
      await dbInstance.execSQL('UPDATE weight_records SET WEIGHT = ? WHERE id = ?', [numericWeight, editingRecordId.value]);
      isEditing.value = false;
      editingRecordId.value = null;
    } else {
      const currentTimestamp = new Date().toISOString();
      await dbInstance.execSQL('INSERT INTO weight_records (CREATED_AT, WEIGHT) VALUES (?, ?)', [currentTimestamp, numericWeight]);
    }

    weightInput.value = '';
    await loadRecords();
  } catch (error) {
    console.error('Database Write Operation Aborted:', error);
  }
}

function startEdit(item) {
  weightInput.value = item.WEIGHT.toString();
  isEditing.value = true;
  editingRecordId.value = item.id;
}

function cancelEdit() {
  weightInput.value = '';
  isEditing.value = false;
  editingRecordId.value = null;
}

function confirmDelete(id) {
  Dialogs.confirm({
    title: 'Delete Entry',
    message: 'Are you sure you want to permanently remove this weight milestone?',
    okButtonText: 'Confirm',
    cancelButtonText: 'Cancel'
  }).then(async (userConfirmed) => {
    if (userConfirmed) {
      try {
        await initDb();
        await dbInstance.execSQL('DELETE FROM weight_records WHERE id = ?', [id]);
        await loadRecords();
      } catch (error) {
        console.error('Database Mutation Failure During Dropping Row:', error);
      }
    }
  });
}

function formatDate(isoString) {
  const parsedDate = new Date(isoString);
  return parsedDate.toLocaleDateString() + ' @ ' + parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
  loadRecords();
});
</script>

<style scoped>
.action-bar {
  background-color: #2c3e50;
  color: #ffffff;
}
.input-container {
  background-color: #ecf0f1;
  border-bottom-width: 2;
  border-bottom-color: #bdc3c7;
}
.section-title {
  font-size: 15;
  font-weight: bold;
  margin-bottom: 6;
  color: #34495e;
}
.input-field {
  font-size: 18;
  padding: 8;
  background-color: #ffffff;
  border-radius: 6;
}
.btn-save {
  background-color: #27ae60;
  color: #ffffff;
  margin-left: 8;
  padding: 0 12;
  border-radius: 6;
}
.btn-cancel {
  background-color: #7f8c8d;
  color: #ffffff;
  margin-top: 6;
}
.list-item {
  border-bottom-width: 1;
  border-bottom-color: #e2e8f0;
}
.weight-label {
  font-size: 22;
  font-weight: bold;
  color: #2c3e50;
}
.date-label {
  font-size: 13;
  color: #7f8c8d;
}
.btn-edit {
  background-color: #f39c12;
  color: #ffffff;
  margin-right: 6;
  font-size: 12;
  border-radius: 4;
}
.btn-delete {
  background-color: #c0392b;
  color: #ffffff;
  font-size: 12;
  border-radius: 4;
}
</style>
