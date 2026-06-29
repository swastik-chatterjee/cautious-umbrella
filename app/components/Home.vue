<template>
  <Page class="page">
    <ActionBar title="KG Weight Tracker" class="action-bar" />

    <GridLayout rows="auto, *" columns="*">
      <!-- INPUT SECTION -->
      <StackLayout row="0" class="input-section">
        <Label :text="isEditing ? '✏️ Modify Entry' : '➕ Record Weight'" class="section-title" />

        <GridLayout columns="*, auto" rows="auto" class="input-row">
          <TextField
            col="0"
            v-model="weightInput"
            hint="Enter weight (kg)"
            keyboardType="number"
            class="weight-input"
            @blur="trimInput"
          />
          <Button
            col="1"
            :text="isEditing ? '💾 Save' : '✅ Add'"
            @tap="handleSave"
            :class="isEditing ? 'btn-edit-save' : 'btn-add-save'"
          />
        </GridLayout>

        <Button
          v-if="isEditing"
          text="❌ Cancel"
          @tap="cancelEdit"
          class="btn-cancel-edit"
        />
      </StackLayout>

      <!-- STATS SECTION -->
      <ScrollView row="1" class="scroll-container">
        <StackLayout>
          <!-- EMPTY STATE -->
          <StackLayout v-if="records.length === 0" class="empty-state">
            <Label text="📊" class="empty-icon" />
            <Label text="No weight records yet" class="empty-title" />
            <Label text="Start tracking by adding your first entry" class="empty-subtitle" />
          </StackLayout>

          <!-- STATS CARDS -->
          <StackLayout v-else class="stats-container">
            <GridLayout columns="*, *" rows="auto" class="stats-grid">
              <StackLayout col="0" class="stat-card">
                <Label text="Current" class="stat-label" />
                <Label :text="latestWeight + ' kg'" class="stat-value" />
              </StackLayout>
              <StackLayout col="1" class="stat-card">
                <Label text="Total Logs" class="stat-label" />
                <Label :text="records.length.toString()" class="stat-value" />
              </StackLayout>
            </GridLayout>

            <GridLayout columns="*, *" rows="auto" class="stats-grid">
              <StackLayout col="0" class="stat-card">
                <Label text="Highest" class="stat-label" />
                <Label :text="highestWeight + ' kg'" class="stat-value" />
              </StackLayout>
              <StackLayout col="1" class="stat-card">
                <Label text="Lowest" class="stat-label" />
                <Label :text="lowestWeight + ' kg'" class="stat-value" />
              </StackLayout>
            </GridLayout>

            <!-- HISTORY SECTION -->
            <Label text="📋 History" class="history-title" />
            <ListView :items="records" class="records-list">
              <v-template let-item="item">
                <GridLayout columns="*, auto, auto" class="record-item" p="12">
                  <StackLayout col="0" class="record-info">
                    <Label :text="item.WEIGHT + ' kg'" class="record-weight" />
                    <Label :text="formatDate(item.CREATED_AT)" class="record-date" />
                  </StackLayout>

                  <Button
                    col="1"
                    text="✏️"
                    @tap="startEdit(item)"
                    class="btn-icon btn-edit-icon"
                  />

                  <Button
                    col="2"
                    text="🗑️"
                    @tap="confirmDelete(item.id)"
                    class="btn-icon btn-delete-icon"
                  />
                </GridLayout>
              </v-template>
            </ListView>
          </StackLayout>
        </StackLayout>
      </ScrollView>
    </GridLayout>
  </Page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Dialogs } from '@nativescript/core';
import { storageService, WeightRecord } from '~/services/StorageService';

// State Management
const records = ref<WeightRecord[]>([]);
const weightInput = ref<string>('');
const isEditing = ref<boolean>(false);
const editingRecordId = ref<string | null>(null);

// Computed Properties
const latestWeight = computed(() => {
  return records.value.length > 0 ? records.value[0].WEIGHT.toFixed(1) : '—';
});

const highestWeight = computed(() => {
  if (records.value.length === 0) return '—';
  return Math.max(...records.value.map(r => r.WEIGHT)).toFixed(1);
});

const lowestWeight = computed(() => {
  if (records.value.length === 0) return '—';
  return Math.min(...records.value.map(r => r.WEIGHT)).toFixed(1);
});

// Load Records from Storage
function loadRecords(): void {
  try {
    records.value = storageService.getAllRecords();
  } catch (error) {
    console.error('Failed to load records:', error);
    Dialogs.alert('Failed to load weight records.');
  }
}

// Input Validation
function trimInput(): void {
  weightInput.value = weightInput.value.trim();
}

function validateWeight(weight: number): boolean {
  return !isNaN(weight) && weight > 0 && weight < 500;
}

// Save or Update Record
function handleSave(): void {
  trimInput();

  if (!weightInput.value) {
    Dialogs.alert('Please enter a weight value.');
    return;
  }

  const numericWeight = parseFloat(weightInput.value);

  if (!validateWeight(numericWeight)) {
    Dialogs.alert('Please enter a valid weight (0-500 kg).');
    return;
  }

  try {
    if (isEditing.value && editingRecordId.value !== null) {
      storageService.updateRecord(editingRecordId.value, numericWeight);
    } else {
      storageService.addRecord(numericWeight);
    }

    weightInput.value = '';
    isEditing.value = false;
    editingRecordId.value = null;
    loadRecords();
  } catch (error) {
    console.error('Save operation failed:', error);
    Dialogs.alert('Failed to save weight record.');
  }
}

// Edit Record
function startEdit(item: WeightRecord): void {
  weightInput.value = item.WEIGHT.toString();
  isEditing.value = true;
  editingRecordId.value = item.id;
}

// Cancel Edit
function cancelEdit(): void {
  weightInput.value = '';
  isEditing.value = false;
  editingRecordId.value = null;
}

// Delete Record with Confirmation
function confirmDelete(id: string): void {
  Dialogs.confirm({
    title: 'Delete Entry',
    message: 'Are you sure you want to delete this weight record?',
    okButtonText: 'Delete',
    cancelButtonText: 'Cancel'
  }).then((confirmed) => {
    if (confirmed) {
      try {
        storageService.deleteRecord(id);
        loadRecords();
      } catch (error) {
        console.error('Delete operation failed:', error);
        Dialogs.alert('Failed to delete weight record.');
      }
    }
  });
}

// Format Date Display
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  } catch (error) {
    return 'Invalid date';
  }
}

// Lifecycle
onMounted(() => {
  loadRecords();
});
</script>

<style scoped>
/* Action Bar */
.action-bar {
  background-color: #2c3e50;
  color: #ffffff;
  font-size: 18;
  font-weight: bold;
}

/* Page */
.page {
  background-color: #f5f7fa;
}

/* Input Section */
.input-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20;
  border-bottom-width: 2;
  border-bottom-color: #5a67d8;
}

.section-title {
  font-size: 16;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 12;
  text-align: center;
}

.input-row {
  margin-bottom: 10;
  height: 44;
}

.weight-input {
  font-size: 18;
  padding: 10 12;
  background-color: #ffffff;
  border-radius: 8;
  color: #2c3e50;
}

.btn-add-save,
.btn-edit-save {
  margin-left: 8;
  padding: 10 16;
  border-radius: 8;
  font-weight: bold;
  color: #ffffff;
  font-size: 14;
}

.btn-add-save {
  background-color: #27ae60;
}

.btn-edit-save {
  background-color: #f39c12;
}

.btn-cancel-edit {
  background-color: rgba(192, 57, 43, 0.8);
  color: #ffffff;
  margin-top: 8;
  padding: 10;
  border-radius: 8;
  font-weight: bold;
}

/* Scroll Container */
.scroll-container {
  padding: 0;
}

/* Empty State */
.empty-state {
  padding: 60 20;
  text-align: center;
}

.empty-icon {
  font-size: 60;
  margin-bottom: 12;
}

.empty-title {
  font-size: 18;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 6;
}

.empty-subtitle {
  font-size: 14;
  color: #7f8c8d;
}

/* Stats Container */
.stats-container {
  padding: 16;
}

.stats-grid {
  margin-bottom: 16;
  height: auto;
}

.stat-card {
  background-color: #ffffff;
  padding: 16;
  margin-right: 8;
  border-radius: 12;
  border-width: 1;
  border-color: #e2e8f0;
}

.stat-card:last-child {
  margin-right: 0;
}

.stat-label {
  font-size: 12;
  color: #7f8c8d;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 6;
  letter-spacing: 0.5;
}

.stat-value {
  font-size: 24;
  font-weight: bold;
  color: #2c3e50;
}

/* History */
.history-title {
  font-size: 14;
  font-weight: bold;
  color: #2c3e50;
  margin: 20 16 12 16;
  text-transform: uppercase;
  letter-spacing: 0.5;
}

.records-list {
  separator-color: #e2e8f0;
}

.record-item {
  background-color: #ffffff;
  border-bottom-width: 1;
  border-bottom-color: #e2e8f0;
  vertical-align: center;
}

.record-info {
  vertical-align: center;
}

.record-weight {
  font-size: 18;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4;
}

.record-date {
  font-size: 12;
  color: #95a5a6;
}

/* Icon Buttons */
.btn-icon {
  padding: 8;
  border-radius: 6;
  font-size: 14;
  margin-left: 4;
}

.btn-edit-icon {
  background-color: #e8f5e9;
  color: #27ae60;
}

.btn-delete-icon {
  background-color: #ffebee;
  color: #c0392b;
}
</style>
